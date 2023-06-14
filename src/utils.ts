export { retryFunction, retryPromise } from 'polallel';

export function banner(title: string): void {
  console.log();
  console.log('=======================================');
  console.log('\t' + title);
  console.log('=======================================');
  console.log();
}

export function heading(title: string): void {
  console.log();
  console.log('> ' + title);
}
