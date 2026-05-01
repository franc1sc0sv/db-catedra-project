import { Elysia } from 'elysia'
import { container } from './bootstrap'

export const createRouter = (opts?: { prefix?: string; name?: string }) =>
  new Elysia(opts).decorate('container', container)
