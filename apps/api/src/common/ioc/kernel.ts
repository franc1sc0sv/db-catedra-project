import 'reflect-metadata'
import { Container } from 'inversify'

export interface AppModule {
  load(container: Container): void
}

export class ApplicationKernel {
  private root!: Container
  private static instance: ApplicationKernel | null = null

  constructor(private readonly modules: AppModule[]) {}

  static getInstance(modules?: AppModule[]): ApplicationKernel {
    if (!ApplicationKernel.instance) {
      ApplicationKernel.instance = new ApplicationKernel(modules!)
      ApplicationKernel.instance.build()
    }
    return ApplicationKernel.instance
  }

  build(): this {
    const c = new Container({ defaultScope: 'Request' })
    for (const m of this.modules) m.load(c)
    this.root = c
    return this
  }

  getContainer(): Container {
    return this.root
  }
}
