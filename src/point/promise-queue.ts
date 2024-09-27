export class PromiseQueue {
  constructor(private queue: Promise<any> = Promise.resolve()) {
    this.queue = Promise.resolve(); // 큐 초기화
  }

  // 큐에 작업 추가
  enqueue(promiseFunc) {
    this.queue = this.queue.then(() => promiseFunc());
    return this.queue;
  }
}
