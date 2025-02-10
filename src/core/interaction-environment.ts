import { AsyncLocalStorage } from 'async_hooks'

const als = new AsyncLocalStorage<{ event: any }>()

function triggerEvent(event: any, callback: () => void) {
  als.run({ event }, callback)
}

function myLibraryFunction() {
  const store = als.getStore()
  console.log('Event:', store?.event)
}

// Usage
triggerEvent({ type: 'click' }, () => {
  myLibraryFunction() // Can access the event without explicitly passing it
})


// make it so all "user" side interaction handling is run as this above
// attach info like the interaction callback
// but also attach a timeout sender that sends a defer after 3000secs
// and on callback we can invalidate that if it hasn't hit yet
// essentially store all interaction context here
// this also allows for "cd .." routes as we know the current path from deep within the call chain

export namespace InteractionEnvironment {

  export function run

}
