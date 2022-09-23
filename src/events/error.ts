import { ClientEvent } from '../types/client-event.js';

class ErrorEvent extends ClientEvent<'error'> {
  execute(error: Error): void {
    console.log('Uncaught exception:');
    console.error(error);
  }
}

export default ErrorEvent;
