/// <reference types="node" />

import BufferList = require("bl/BufferList");

interface LengthDecoderFunction {
    (data: Buffer | BufferList): number;
    bytes: number;
}

interface LengthEncoderFunction {
    (value: number, target?: Buffer, offset?: number): Buffer;
    bytes: number;
}

interface Encoder {
    (options?: EncoderOptions): AsyncGenerator<BufferList|Buffer, BufferList>;
    single: (chunk: Buffer|BufferList, options?: Partial<{lengthEncoder: LengthEncoderFunction}>) => BufferList;
    MIN_POOL_SIZE: number;
    DEFAULT_POOL_SIZE: number;
}

interface EncoderOptions {
    poolSize?: number,
    minPoolSize?: number,
    lengthEncoder?: LengthEncoderFunction
}

interface DecoderOptions<T = BufferList> {
    lengthDecoder: LengthDecoderFunction;
    onData: (data: BufferList|Buffer) => T;
    onLength?: (length: number) => void;
    maxLengthLength: number;
    maxDataLength: number;
}

interface Decoder {
    (options?: Partial<DecoderOptions>): AsyncGenerator<BufferList|Buffer, BufferList>;
    fromReader: (reader: AsyncIterator<Buffer>, options?: Partial<DecoderOptions>) => AsyncGenerator<BufferList|Buffer, BufferList>;
    MAX_LENGTH_LENGTH: number;
    MAX_DATA_LENGTH: number;
}

export interface ReadState {
    dataLength: number
}

export interface ReadResult {
    mode: string,
    chunk?: BufferList,
    buffer: BufferList,
    state?: ReadState,
    data?: BufferList | Buffer,
}

export const encode: Encoder
export const decode: Decoder

export const varintEncode: LengthEncoderFunction;
export const varintDecode: LengthDecoderFunction;

export const int32BEEncode: LengthEncoderFunction;
export const int32BEDecode: LengthDecoderFunction;
