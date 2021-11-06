import {  Waku } from 'js-waku';

export const delayMillis = (delayMs: number): Promise<void> => new Promise(resolve => setTimeout(resolve, delayMs));

export const greet = async (name: string): Promise<string> => {
    let waku = await Waku.create({ bootstrap: true });
    console.log(waku);
    return `Hello ${name}`
}

export const foo = async (): Promise<boolean> => {
  console.log(greet('World'))
  await delayMillis(1000)
  console.log('done')
  return true
}
