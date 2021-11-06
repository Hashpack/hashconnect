import getJoke from './getJoke'

for (let i = 0; i < 20; i++) {
  getJoke().then(joke => {
    console.log(joke)
    console.log('\n \n')
  })
}

export const test = (the: string) => {
    console.log(the);
}