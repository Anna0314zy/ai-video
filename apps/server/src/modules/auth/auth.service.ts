import { Inject, Injectable } from '@nestjs/common'
import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto'
import { ConfigService } from '../../config/config.service.js'
import { AppException } from '../../common/app-exception.js'
import { PrismaService } from '../../prisma/prisma.service.js'

interface JwtPayload {
  sub: number
  accountId: string
  username: string
  iat: number
  exp: number
}

export interface LoginResult {
  token: string
  systemToken: string
  accountId: string
  uid: number
  username: string
  workcode: string
  empNo: string
  email: string
  name: string
  expiresAt: number
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async login(username: string, password: string): Promise<LoginResult> {
    if (!username || !password) {
      throw new AppException('validation')
    }

    let user = await this.prisma.user.findFirst({
      where: { username },
    })

    if (!user) {
      const passwordHash = this.hashPassword(password)
      user = await this.prisma.user.create({
        data: {
          accountId: `pending-${cryptoRandomId()}`,
          username,
          workcode: username,
          passwordHash: passwordHash.hash,
          passwordSalt: passwordHash.salt,
        },
      })
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { accountId: String(user.id) },
      })
      return this.createLoginResult(user)
    }

    if (!this.verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      throw new AppException('invalid-credentials')
    }

    return this.createLoginResult(user)
  }

  async verifyRequestToken(rawToken?: string) {
    const token = this.extractToken(rawToken)
    if (!token) throw new AppException('login-expired')

    const payload = this.verifyJwt(token)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    })
    if (!user) throw new AppException('login-expired')

    return user
  }

  async check(rawToken?: string): Promise<LoginResult> {
    const user = await this.verifyRequestToken(rawToken)
    return this.createLoginResult(user)
  }

  extractToken(rawToken?: string): string {
    const value = rawToken?.trim()
    if (!value) return ''
    return value.toLowerCase().startsWith('bearer ') ? value.slice(7).trim() : value
  }

  private createLoginResult(user: {
    id: number
    accountId: string
    username: string
    workcode: string | null
    email: string | null
  }): LoginResult {
    const token = this.signJwt({
      sub: user.id,
      accountId: user.accountId,
      username: user.username,
    })
    const payload = this.verifyJwt(token)

    return {
      token,
      systemToken: token,
      accountId: user.accountId,
      uid: user.id,
      username: user.username,
      workcode: user.workcode || '',
      empNo: user.workcode || '',
      email: user.email || '',
      name: user.username,
      expiresAt: payload.exp,
    }
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex')
    const hash = pbkdf2Sync(password, salt, 120_000, 32, 'sha256').toString('hex')
    return { salt, hash }
  }

  private verifyPassword(password: string, salt: string, hash: string) {
    if (!salt || !hash) return false
    const inputHash = pbkdf2Sync(password, salt, 120_000, 32, 'sha256')
    const storedHash = Buffer.from(hash, 'hex')
    if (storedHash.length !== inputHash.length) return false
    return timingSafeEqual(inputHash, storedHash)
  }

  private signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
    const now = Math.floor(Date.now() / 1000)
    const jwtPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + this.configService.value.auth.jwtExpiresSeconds,
    }
    const header = { alg: 'HS256', typ: 'JWT' }
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header))
    const encodedPayload = this.base64UrlEncode(JSON.stringify(jwtPayload))
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`)
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  private verifyJwt(token: string): JwtPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.')
    if (!encodedHeader || !encodedPayload || !signature) throw new AppException('login-expired')

    const expectedSignature = this.sign(`${encodedHeader}.${encodedPayload}`)
    const inputSignature = Buffer.from(signature)
    const expectedSignatureBuffer = Buffer.from(expectedSignature)
    if (inputSignature.length !== expectedSignatureBuffer.length || !timingSafeEqual(inputSignature, expectedSignatureBuffer)) {
      throw new AppException('login-expired')
    }

    let payload: JwtPayload
    try {
      payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as JwtPayload
    } catch {
      throw new AppException('login-expired')
    }

    if (!payload.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new AppException('login-expired')
    }
    return payload
  }

  private sign(value: string) {
    return createHmac('sha256', this.configService.value.auth.jwtSecret).update(value).digest('base64url')
  }

  private base64UrlEncode(value: string) {
    return Buffer.from(value).toString('base64url')
  }
}

function cryptoRandomId() {
  return randomBytes(8).toString('hex')
}
