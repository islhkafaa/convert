export interface ConversionJob {
  id: string;
  file: File;
  outputFormat: string;
  quality: number;
  conversionType: string;
}

export interface ConversionResult {
  id: string;
  blob: Blob;
  error?: string;
}

export interface WorkerPoolOptions {
  maxWorkers?: number;
}

export class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private jobQueue: ConversionJob[] = [];
  private activeJobs = new Map<string, ConversionJob>();
  private workerJobs = new Map<Worker, string>();
  private progressCallbacks = new Map<string, (progress: number) => void>();
  private resultCallbacks = new Map<
    string,
    (result: ConversionResult) => void
  >();
  private maxWorkers: number;

  constructor(options: WorkerPoolOptions = {}) {
    this.maxWorkers =
      options.maxWorkers || Math.min(navigator.hardwareConcurrency || 2, 4);
    this.initializeWorkers();
  }

  private initializeWorkers() {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(
        new URL("../workers/conversion-worker.ts", import.meta.url),
        { type: "module" },
      );

      worker.onmessage = (e) => this.handleWorkerMessage(worker, e);
      worker.onerror = (e) => this.handleWorkerError(worker, e);

      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  private handleWorkerMessage(worker: Worker, e: MessageEvent) {
    const { type, jobId, progress, result, error } = e.data;

    switch (type) {
      case "progress": {
        const callback = this.progressCallbacks.get(jobId);
        if (callback) {
          callback(progress);
        }
        break;
      }

      case "complete": {
        const callback = this.resultCallbacks.get(jobId);
        if (callback) {
          callback({ id: jobId, blob: result });
        }
        this.finishJob(worker, jobId);
        break;
      }

      case "error": {
        const callback = this.resultCallbacks.get(jobId);
        if (callback) {
          callback({ id: jobId, blob: new Blob(), error });
        }
        this.finishJob(worker, jobId);
        break;
      }
    }
  }

  private handleWorkerError(worker: Worker, error: ErrorEvent) {
    console.error("Worker error:", error);
    const jobId = this.workerJobs.get(worker);

    if (jobId) {
      const callback = this.resultCallbacks.get(jobId);
      if (callback) {
        callback({
          id: jobId,
          blob: new Blob(),
          error: "Worker crashed",
        });
      }
      this.activeJobs.delete(jobId);
      this.progressCallbacks.delete(jobId);
      this.resultCallbacks.delete(jobId);
      this.workerJobs.delete(worker);
    }

    worker.terminate();
    const index = this.workers.indexOf(worker);
    if (index > -1) {
      const newWorker = new Worker(
        new URL("../workers/conversion-worker.ts", import.meta.url),
        { type: "module" },
      );
      newWorker.onmessage = (e) => this.handleWorkerMessage(newWorker, e);
      newWorker.onerror = (e) => this.handleWorkerError(newWorker, e);
      this.workers[index] = newWorker;
      this.availableWorkers.push(newWorker);
    }
    this.processQueue();
  }

  private finishJob(worker: Worker, jobId: string) {
    this.activeJobs.delete(jobId);
    this.progressCallbacks.delete(jobId);
    this.resultCallbacks.delete(jobId);
    this.workerJobs.delete(worker);
    this.availableWorkers.push(worker);
    this.processQueue();
  }

  private processQueue() {
    while (this.jobQueue.length > 0 && this.availableWorkers.length > 0) {
      const job = this.jobQueue.shift()!;
      const worker = this.availableWorkers.shift()!;

      this.activeJobs.set(job.id, job);
      this.workerJobs.set(worker, job.id);

      worker.postMessage({
        type: "convert",
        jobId: job.id,
        file: job.file,
        outputFormat: job.outputFormat,
        quality: job.quality,
        conversionType: job.conversionType,
      });
    }
  }

  async convert(
    job: ConversionJob,
    onProgress?: (progress: number) => void,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (onProgress) {
        this.progressCallbacks.set(job.id, onProgress);
      }

      this.resultCallbacks.set(job.id, (result) => {
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result.blob);
        }
      });

      this.jobQueue.push(job);
      this.processQueue();
    });
  }

  getActiveJobCount(): number {
    return this.activeJobs.size;
  }

  getQueuedJobCount(): number {
    return this.jobQueue.length;
  }

  terminate() {
    this.workers.forEach((worker) => worker.terminate());

    for (const [jobId, callback] of this.resultCallbacks.entries()) {
      callback({
        id: jobId,
        blob: new Blob(),
        error: "Worker pool terminated",
      });
    }

    this.workers = [];
    this.availableWorkers = [];
    this.jobQueue = [];
    this.activeJobs.clear();
    this.workerJobs.clear();
    this.progressCallbacks.clear();
    this.resultCallbacks.clear();
  }
}
