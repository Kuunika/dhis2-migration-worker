export class FileNotFound extends Error {
  constructor(message?: string) {
    super(message);

    this.name = 'FileNotFound';
    Object.setPrototypeOf(this, FileNotFound.prototype);
  }
}
