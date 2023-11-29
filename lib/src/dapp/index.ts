import { AccountId, LedgerId } from '@hashgraph/sdk'
import { SessionTypes, SignClientTypes } from '@walletconnect/types'
import QRCodeModal from '@walletconnect/qrcode-modal'
import Client, { SignClient } from '@walletconnect/sign-client'
import { getSdkError } from '@walletconnect/utils'
import { HederaJsonRpcMethod, accountAndLedgerFromSession, networkNamespaces } from '../shared'
import { DAppSigner } from './DAppSigner'

export * from './helpers'

type BaseLogger = 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'fatal'

export class DAppConnector {
  dAppMetadata: SignClientTypes.Metadata
  network: LedgerId = LedgerId.TESTNET
  projectId?: string
  supportedMethods: string[] = []
  supportedEvents: string[] = []

  walletConnectClient: Client | null = null
  signers: DAppSigner[] = []
  isInitializing = false

  constructor(
    metadata: SignClientTypes.Metadata,
    network: LedgerId,
    projectId: string | undefined,
    methods?: string[],
    events?: string[],
  ) {
    this.dAppMetadata = metadata
    this.network = network
    this.supportedMethods = methods ?? Object.values(HederaJsonRpcMethod)
    this.supportedEvents = events ?? []
    this.projectId = projectId
  }

  async init({ logger }: { logger?: BaseLogger } = {}) {
    try {
      this.isInitializing = true
      if (!this.projectId) {
        throw new Error('Project ID is not defined')
      }
      this.walletConnectClient = await SignClient.init({
        logger,
        relayUrl: 'wss://relay.walletconnect.com',
        projectId: this.projectId,
        metadata: this.dAppMetadata,
      })
      const existingSession = await this.checkPersistedState()
      existingSession.forEach(async (session) => {
        await this.onSessionConnected(session)
      })
    } finally {
      this.isInitializing = false
    }
  }

  public async connectQR(pairingTopic?: string): Promise<void> {
    return this.abortableConnect(async () => {
      try {
        const { uri, approval } = await this.connectURI(pairingTopic)
        if (!uri) throw new Error('URI is not defined')
        QRCodeModal.open(uri, () => {
          throw new Error('User rejected pairing')
        })

        await this.onSessionConnected(await approval())
      } finally {
        QRCodeModal.close()
      }
    })
  }

  public async connect(
    launchCallback: (uri: string) => void,
    pairingTopic?: string,
  ): Promise<void> {
    return this.abortableConnect(async () => {
      const { uri, approval } = await this.connectURI(pairingTopic)
      if (!uri) throw new Error('URI is not defined')
      launchCallback(uri)
      const session = await approval()
      await this.onSessionConnected(session)
    })
  }

  private abortableConnect = async <T>(callback: () => Promise<T>): Promise<T> => {
    const pairTimeoutMs = 480_000
    const timeout = setTimeout(() => {
      QRCodeModal.close()
      throw new Error(`Connect timed out after ${pairTimeoutMs}(ms)`)
    }, pairTimeoutMs)

    try {
      return await callback()
    } finally {
      clearTimeout(timeout)
    }
  }

  public async disconnect(topic: string): Promise<void> {
    if (!this.walletConnectClient) {
      throw new Error('WalletConnect is not initialized')
    }
    if (!topic) {
      throw new Error('No topic provided')
    }

    await this.walletConnectClient.disconnect({
      topic,
      reason: getSdkError('USER_DISCONNECTED'),
    })
  }

  private createSigners(session: SessionTypes.Struct): DAppSigner[] {
    const allNamespaceAccounts = accountAndLedgerFromSession(session)
    return allNamespaceAccounts.map(
      ({ account, network }: { account: AccountId; network: LedgerId }) =>
        new DAppSigner(account, this.walletConnectClient!, session.topic, network),
    )
  }

  private async onSessionConnected(session: SessionTypes.Struct) {
    this.signers.push(...this.createSigners(session))
  }

  private async pingWithRetry(topic: string, retries = 3): Promise<void> {
    try {
      await this.walletConnectClient!.ping({ topic })
    } catch (error) {
      if (retries > 0) {
        console.log(`Ping failed, ${retries} retries left. Retrying in 1 seconds...`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await this.pingWithRetry(topic, retries - 1)
      } else {
        console.log(`Ping failed after ${retries} retries. Aborting...`)
        throw error
      }
    }
  }

  private async checkPersistedState() {
    if (!this.walletConnectClient) {
      throw new Error('WalletConnect is not initialized')
    }

    if (this.walletConnectClient.session.length) {
      const sessionCheckPromises: Promise<SessionTypes.Struct>[] =
        this.walletConnectClient.session.getAll().map(
          (session: SessionTypes.Struct) =>
            new Promise(async (resolve, reject) => {
              try {
                await this.pingWithRetry(session.topic)
                resolve(session)
              } catch (error) {
                try {
                  console.log('Ping failed, disconnecting from session. Topic: ', session.topic)
                  await this.walletConnectClient!.disconnect({
                    topic: session.topic,
                    reason: getSdkError('SESSION_SETTLEMENT_FAILED'),
                  })
                } catch (e) {
                  console.log('Non existing session with topic:', session.topic)
                  reject('Non existing session')
                }
              }
            }),
        )
      const sessionCheckResults = (await Promise.allSettled(sessionCheckPromises)) as {
        status: 'fulfilled' | 'rejected'
        value: SessionTypes.Struct
      }[]

      const sessions = sessionCheckResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value as SessionTypes.Struct)

      const errors = sessionCheckResults.filter((result) => result.status === 'rejected')
      if (errors.length) {
        console.log('Errors while checking persisted state:', errors)
      }

      return sessions
    }

    return []
  }

  private async connectURI(
    pairingTopic?: string,
  ): Promise<{ uri?: string; approval: () => Promise<SessionTypes.Struct> }> {
    if (!this.walletConnectClient) {
      throw new Error('WalletConnect is not initialized')
    }
    return this.walletConnectClient.connect({
      pairingTopic,
      requiredNamespaces: networkNamespaces(
        this.network,
        this.supportedMethods,
        this.supportedEvents,
      ),
    })
  }
}
