class Queue<T> {
  private items: T[] = []; // The internal storage array

  // Add an element to the end of the queue (enqueue)
  enqueue(item: T): void {
    this.items.push(item); 
  }

  // Remove and return the first element from the queue (dequeue)
  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined; // Or throw an error for an empty queue
    }
    return this.items.shift() as T; 
  }

  // Return the first element of the queue without removing it (peek)
  peek(): T | undefined {
    return this.isEmpty() ? undefined : this.items[0];
  }

  // Check if the queue is empty
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Return the size of the queue
  size(): number {
    return this.items.length;
  }
}
export type Submission = {
  code: string;
  language: string;
  userId: string;
  question: string;
};

const submissionQueue = new Queue<Submission>();

export default submissionQueue;
