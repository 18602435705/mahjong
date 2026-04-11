export type Suit = 'W' | 'T' | 'B'
export type Tile = `${Suit}${number}`

export type MeldType = 'peng' | 'mingGang' | 'anGang' | 'buGang'

export interface Meld {
  type: MeldType
  tile: Tile
  from?: number
}

export interface PlayerState {
  id: number
  name: string
  isHuman: boolean
  hand: Tile[]
  melds: Meld[]
  discards: Tile[]
  score: number
}

export type HuType = 'pinghu' | 'duiduihu' | 'qidui' | 'qingyise'

export interface HuResult {
  type: HuType
  baseFan: number
}

export interface WinInfo {
  winner: number
  from?: number
  method: 'zimo' | 'dianpao' | 'qianggang'
  hu: HuResult
  totalFan: number
  tile: Tile
}

export interface ClaimRequest {
  player: number
  action: 'hu' | 'mingGang' | 'peng'
  tile: Tile
  from: number
}

export interface QiangGangState {
  actor: number
  tile: Tile
  candidates: number[]
  index: number
}

export type Phase = 'playerTurn' | 'claimDecision' | 'qiangGangDecision' | 'gameOver'

export interface GameState {
  players: PlayerState[]
  wall: Tile[]
  currentPlayer: number
  phase: Phase
  pendingClaims: ClaimRequest[]
  qiangGang: QiangGangState | null
  lastDiscard: { tile: Tile; from: number } | null
  logs: string[]
  round: number
  winner: number | null
  winInfo: WinInfo | null
}

export type GameAction =
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_GAME' }
  | { type: 'HUMAN_DISCARD'; tile: Tile }
  | { type: 'HUMAN_SELF_HU' }
  | { type: 'HUMAN_GANG'; gangType: 'anGang' | 'buGang'; tile: Tile }
  | { type: 'HUMAN_CLAIM_DECISION'; accept: boolean }
  | { type: 'HUMAN_QIANG_GANG_DECISION'; accept: boolean }
  | { type: 'AI_STEP' }

const SUITS: Suit[] = ['W', 'T', 'B']
const MAX_LOGS = 18

const HU_TYPE_TEXT: Record<HuType, string> = {
  pinghu: '平胡',
  duiduihu: '对对胡',
  qidui: '七对',
  qingyise: '清一色',
}

const FAN_BY_HU_TYPE: Record<HuType, number> = {
  pinghu: 1,
  duiduihu: 2,
  qidui: 2,
  qingyise: 3,
}

const PLAYER_NAMES = ['你', 'AI-右', 'AI-上', 'AI-左']

const TILE_TYPES: Tile[] = SUITS.flatMap((suit) =>
  Array.from({ length: 9 }, (_, index) => `${suit}${index + 1}` as Tile),
)

export const huTypeText = (type: HuType) => HU_TYPE_TEXT[type]

export const tileToText = (tile: Tile): string => {
  const suitLabel: Record<Suit, string> = {
    W: '万',
    T: '条',
    B: '筒',
  }

  return `${tileRank(tile)}${suitLabel[tileSuit(tile)]}`
}

export const meldTypeText = (type: MeldType) => {
  if (type === 'peng') return '碰'
  if (type === 'mingGang') return '明杠'
  if (type === 'anGang') return '暗杠'
  return '补杠'
}

export const createInitialGameState = () => createRoundState([0, 0, 0, 0], 1)

export const getCurrentClaim = (state: GameState): ClaimRequest | null =>
  state.phase === 'claimDecision' && state.pendingClaims.length > 0
    ? state.pendingClaims[0]
    : null

export const getCurrentQiangGangCandidate = (state: GameState): number | null => {
  if (state.phase !== 'qiangGangDecision' || !state.qiangGang) {
    return null
  }

  return state.qiangGang.candidates[state.qiangGang.index] ?? null
}

export const getHumanTurnOptions = (state: GameState) => {
  const human = state.players[0]
  const canAct = state.phase === 'playerTurn' && state.currentPlayer === 0
  const handLength = human.hand.length
  const drawState = handLength % 3 === 2
  const selfHu = canAct && drawState ? evaluateHu(human.hand, human.melds) : null

  return {
    canDiscard: canAct,
    selfHu,
    anGangTiles: canAct && drawState ? getAnGangOptions(human) : [],
    buGangTiles: canAct && drawState ? getBuGangOptions(human) : [],
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEXT_ROUND': {
      const scores = state.players.map((player) => player.score)
      return createRoundState(scores, state.round + 1)
    }
    case 'RESET_GAME': {
      return createRoundState([0, 0, 0, 0], 1)
    }
    case 'HUMAN_DISCARD': {
      if (state.phase !== 'playerTurn' || state.currentPlayer !== 0) {
        return state
      }

      return discardTile(state, 0, action.tile)
    }
    case 'HUMAN_SELF_HU': {
      if (state.phase !== 'playerTurn' || state.currentPlayer !== 0) {
        return state
      }

      return trySelfHu(state, 0)
    }
    case 'HUMAN_GANG': {
      if (state.phase !== 'playerTurn' || state.currentPlayer !== 0) {
        return state
      }

      if (action.gangType === 'anGang') {
        return tryAnGang(state, 0, action.tile)
      }

      return tryBuGang(state, 0, action.tile)
    }
    case 'HUMAN_CLAIM_DECISION': {
      const claim = getCurrentClaim(state)
      if (!claim || claim.player !== 0) {
        return state
      }

      if (action.accept) {
        return acceptClaim(state, claim)
      }

      return passClaim(state)
    }
    case 'HUMAN_QIANG_GANG_DECISION': {
      const candidate = getCurrentQiangGangCandidate(state)
      if (candidate !== 0) {
        return state
      }

      if (action.accept) {
        return acceptQiangGangHu(state, 0)
      }

      return passQiangGangHu(state)
    }
    case 'AI_STEP': {
      return runAIStep(state)
    }
    default:
      return state
  }
}

function runAIStep(state: GameState): GameState {
  if (state.phase === 'gameOver') {
    return state
  }

  if (state.phase === 'claimDecision') {
    const claim = getCurrentClaim(state)
    if (!claim || state.players[claim.player].isHuman) {
      return state
    }

    if (claim.action === 'hu') {
      return acceptClaim(state, claim)
    }

    if (claim.action === 'mingGang') {
      return acceptClaim(state, claim)
    }

    const shouldPeng = true
    return shouldPeng ? acceptClaim(state, claim) : passClaim(state)
  }

  if (state.phase === 'qiangGangDecision') {
    const candidate = getCurrentQiangGangCandidate(state)
    if (candidate === null || state.players[candidate].isHuman) {
      return state
    }

    return acceptQiangGangHu(state, candidate)
  }

  const actor = state.currentPlayer
  const player = state.players[actor]
  if (player.isHuman) {
    return state
  }

  const selfHu = evaluateHu(player.hand, player.melds)
  if (selfHu && player.hand.length % 3 === 2) {
    return settleHu(state, {
      winner: actor,
      method: 'zimo',
      tile: player.hand[player.hand.length - 1],
      hu: selfHu,
    })
  }

  if (player.hand.length % 3 === 2) {
    const buGangTiles = getBuGangOptions(player)
    if (buGangTiles.length > 0) {
      return tryBuGang(state, actor, buGangTiles[0])
    }

    const anGangTiles = getAnGangOptions(player)
    if (anGangTiles.length > 0) {
      return tryAnGang(state, actor, anGangTiles[0])
    }
  }

  if (player.hand.length === 0) {
    return state
  }

  const discard = pickAIDiscard(player)
  return discardTile(state, actor, discard)
}

function createRoundState(scores: number[], round: number): GameState {
  const wall = createWall()
  const players: PlayerState[] = Array.from({ length: 4 }, (_, index) => ({
    id: index,
    name: PLAYER_NAMES[index],
    isHuman: index === 0,
    hand: [],
    melds: [],
    discards: [],
    score: scores[index] ?? 0,
  }))

  for (let i = 0; i < 13; i += 1) {
    for (const player of players) {
      const tile = wall.pop()
      if (tile) {
        player.hand.push(tile)
      }
    }
  }

  const dealerTile = wall.pop()
  if (dealerTile) {
    players[0].hand.push(dealerTile)
  }

  players.forEach((player) => {
    sortTiles(player.hand)
  })

  const state: GameState = {
    players,
    wall,
    currentPlayer: 0,
    phase: 'playerTurn',
    pendingClaims: [],
    qiangGang: null,
    lastDiscard: null,
    logs: [],
    round,
    winner: null,
    winInfo: null,
  }

  appendLog(state, `第 ${round} 局开始，庄家是${players[0].name}`)

  return state
}

function createWall(): Tile[] {
  const wall: Tile[] = []

  for (const type of TILE_TYPES) {
    for (let i = 0; i < 4; i += 1) {
      wall.push(type)
    }
  }

  for (let i = wall.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[wall[i], wall[j]] = [wall[j], wall[i]]
  }

  return wall
}

function discardTile(baseState: GameState, actor: number, tile: Tile): GameState {
  const state = cloneState(baseState)
  const player = state.players[actor]
  const removed = removeTiles(player.hand, tile, 1)

  if (!removed) {
    return baseState
  }

  player.discards.push(tile)
  sortTiles(player.hand)
  state.lastDiscard = { tile, from: actor }
  appendLog(state, `${player.name} 打出 ${tileToText(tile)}`)

  const claims = buildClaimQueue(state, tile, actor)
  if (claims.length > 0) {
    state.pendingClaims = claims
    state.phase = 'claimDecision'
    state.qiangGang = null
    return state
  }

  return enterTurn(state, nextPlayer(actor), true)
}

function buildClaimQueue(
  state: GameState,
  tile: Tile,
  from: number,
): ClaimRequest[] {
  const mingGang: ClaimRequest[] = []
  const peng: ClaimRequest[] = []

  for (let offset = 1; offset <= 3; offset += 1) {
    const player = (from + offset) % 4
    const target = state.players[player]
    const count = countTile(target.hand, tile)

    if (count >= 3) {
      mingGang.push({ player, action: 'mingGang', tile, from })
    }

    if (count >= 2) {
      peng.push({ player, action: 'peng', tile, from })
    }
  }

  return [...mingGang, ...peng]
}

function passClaim(baseState: GameState): GameState {
  const state = cloneState(baseState)
  if (state.pendingClaims.length === 0) {
    return baseState
  }

  const [current] = state.pendingClaims
  appendLog(state, `${state.players[current.player].name} 选择过`)
  state.pendingClaims.shift()

  if (state.pendingClaims.length > 0) {
    return state
  }

  if (!state.lastDiscard) {
    return state
  }

  return enterTurn(state, nextPlayer(state.lastDiscard.from), true)
}

function acceptClaim(baseState: GameState, claim: ClaimRequest): GameState {
  if (claim.action === 'hu') {
    const huResult = evaluateHu(
      [...baseState.players[claim.player].hand, claim.tile],
      baseState.players[claim.player].melds,
    )

    if (!huResult) {
      return passClaim(baseState)
    }

    return settleHu(baseState, {
      winner: claim.player,
      from: claim.from,
      method: 'dianpao',
      tile: claim.tile,
      hu: huResult,
    })
  }

  if (claim.action === 'mingGang') {
    const state = cloneState(baseState)
    const actor = state.players[claim.player]

    if (!removeTiles(actor.hand, claim.tile, 3)) {
      return passClaim(baseState)
    }

    actor.melds.push({ type: 'mingGang', tile: claim.tile, from: claim.from })
    sortTiles(actor.hand)
    settleMingGangScore(state, claim.player, claim.from)
    appendLog(
      state,
      `${actor.name} 明杠 ${tileToText(claim.tile)}，${state.players[claim.from].name} 付 1 分`,
    )

    state.pendingClaims = []
    state.lastDiscard = null
    state.phase = 'playerTurn'
    state.currentPlayer = claim.player

    return enterTurn(state, claim.player, true)
  }

  const state = cloneState(baseState)
  const actor = state.players[claim.player]

  if (!removeTiles(actor.hand, claim.tile, 2)) {
    return passClaim(baseState)
  }

  actor.melds.push({ type: 'peng', tile: claim.tile, from: claim.from })
  sortTiles(actor.hand)
  appendLog(state, `${actor.name} 碰 ${tileToText(claim.tile)}`)

  state.pendingClaims = []
  state.lastDiscard = null
  state.qiangGang = null
  state.currentPlayer = claim.player
  state.phase = 'playerTurn'

  return state
}

function trySelfHu(baseState: GameState, actor: number): GameState {
  const player = baseState.players[actor]
  if (player.hand.length % 3 !== 2) {
    return baseState
  }

  const hu = evaluateHu(player.hand, player.melds)
  if (!hu) {
    return baseState
  }

  return settleHu(baseState, {
    winner: actor,
    method: 'zimo',
    tile: player.hand[player.hand.length - 1],
    hu,
  })
}

function tryAnGang(baseState: GameState, actor: number, tile: Tile): GameState {
  const state = cloneState(baseState)
  const player = state.players[actor]

  if (state.phase !== 'playerTurn' || state.currentPlayer !== actor) {
    return baseState
  }

  if (countTile(player.hand, tile) < 4 || player.hand.length % 3 !== 2) {
    return baseState
  }

  removeTiles(player.hand, tile, 4)
  player.melds.push({ type: 'anGang', tile })
  sortTiles(player.hand)
  settleAnOrBuGangScore(state, actor)
  appendLog(state, `${player.name} 暗杠 ${tileToText(tile)}，其余三家各付 1 分`)

  return enterTurn(state, actor, true)
}

function tryBuGang(baseState: GameState, actor: number, tile: Tile): GameState {
  if (baseState.phase !== 'playerTurn' || baseState.currentPlayer !== actor) {
    return baseState
  }

  const player = baseState.players[actor]
  const canBuGang =
    player.hand.length % 3 === 2 &&
    player.melds.some((meld) => meld.type === 'peng' && meld.tile === tile) &&
    countTile(player.hand, tile) >= 1

  if (!canBuGang) {
    return baseState
  }

  const qiangGangCandidates: number[] = []
  for (let offset = 1; offset <= 3; offset += 1) {
    const index = (actor + offset) % 4
    const target = baseState.players[index]
    const huResult = evaluateHu([...target.hand, tile], target.melds)
    if (huResult) {
      qiangGangCandidates.push(index)
    }
  }

  const state = cloneState(baseState)
  if (qiangGangCandidates.length > 0) {
    state.phase = 'qiangGangDecision'
    state.qiangGang = {
      actor,
      tile,
      candidates: qiangGangCandidates,
      index: 0,
    }
    state.pendingClaims = []
    state.lastDiscard = null
    appendLog(
      state,
      `${state.players[actor].name} 尝试补杠 ${tileToText(tile)}，等待抢杠胡`,
    )
    return state
  }

  return executeBuGang(state, actor, tile)
}

function acceptQiangGangHu(baseState: GameState, winner: number): GameState {
  if (!baseState.qiangGang) {
    return baseState
  }

  const { actor, tile } = baseState.qiangGang
  const hu = evaluateHu([...baseState.players[winner].hand, tile], baseState.players[winner].melds)

  if (!hu) {
    return passQiangGangHu(baseState)
  }

  return settleHu(baseState, {
    winner,
    from: actor,
    method: 'qianggang',
    tile,
    hu,
  })
}

function passQiangGangHu(baseState: GameState): GameState {
  if (baseState.phase !== 'qiangGangDecision' || !baseState.qiangGang) {
    return baseState
  }

  const state = cloneState(baseState)
  const qiangGang = state.qiangGang
  if (!qiangGang) {
    return baseState
  }

  const currentCandidate = qiangGang.candidates[qiangGang.index]
  appendLog(state, `${state.players[currentCandidate].name} 放弃抢杠胡`)
  qiangGang.index += 1

  if (qiangGang.index < qiangGang.candidates.length) {
    return state
  }

  const actor = qiangGang.actor
  const tile = qiangGang.tile
  state.qiangGang = null
  return executeBuGang(state, actor, tile)
}

function executeBuGang(baseState: GameState, actor: number, tile: Tile): GameState {
  const state = cloneState(baseState)
  const player = state.players[actor]

  if (!removeTiles(player.hand, tile, 1)) {
    return baseState
  }

  const meld = player.melds.find((item) => item.type === 'peng' && item.tile === tile)
  if (!meld) {
    return baseState
  }

  meld.type = 'buGang'
  sortTiles(player.hand)
  settleAnOrBuGangScore(state, actor)
  appendLog(state, `${player.name} 补杠 ${tileToText(tile)}，其余三家各付 1 分`)

  state.qiangGang = null
  state.pendingClaims = []
  state.lastDiscard = null

  return enterTurn(state, actor, true)
}

function settleHu(
  baseState: GameState,
  options: {
    winner: number
    from?: number
    method: 'zimo' | 'dianpao' | 'qianggang'
    tile: Tile
    hu: HuResult
  },
): GameState {
  const state = cloneState(baseState)
  const { winner, from, method, tile, hu } = options
  const zimoExtra = method === 'zimo' ? 1 : 0
  const totalFan = hu.baseFan + zimoExtra

  if (method === 'zimo') {
    for (let i = 0; i < state.players.length; i += 1) {
      if (i === winner) {
        continue
      }
      state.players[i].score -= totalFan
      state.players[winner].score += totalFan
    }

    appendLog(
      state,
      `${state.players[winner].name} 自摸 ${tileToText(tile)}（${huTypeText(hu.type)} ${hu.baseFan} 番 + 自摸 1 番），共 ${totalFan} 番，三家各付 ${totalFan} 分`,
    )
  } else if (typeof from === 'number') {
    state.players[from].score -= totalFan
    state.players[winner].score += totalFan

    const methodText = method === 'qianggang' ? '抢杠胡' : '点炮胡'
    appendLog(
      state,
      `${state.players[winner].name} ${methodText} ${tileToText(tile)}（${huTypeText(hu.type)} ${hu.baseFan} 番），${state.players[from].name} 付 ${totalFan} 分`,
    )

    state.players[winner].hand.push(tile)
    sortTiles(state.players[winner].hand)
  }

  state.phase = 'gameOver'
  state.currentPlayer = winner
  state.winner = winner
  state.winInfo = {
    winner,
    from,
    method,
    hu,
    totalFan,
    tile,
  }
  state.pendingClaims = []
  state.qiangGang = null
  state.lastDiscard = null

  return state
}

function enterTurn(baseState: GameState, playerIndex: number, shouldDraw: boolean): GameState {
  const state = cloneState(baseState)
  state.currentPlayer = playerIndex
  state.phase = 'playerTurn'
  state.pendingClaims = []
  state.qiangGang = null
  state.lastDiscard = null

  if (!shouldDraw) {
    return state
  }

  const drawn = state.wall.pop()
  if (!drawn) {
    appendLog(state, '牌墙摸完，流局（无流局结算）')
    state.phase = 'gameOver'
    state.winner = null
    state.winInfo = null
    return state
  }

  const player = state.players[playerIndex]
  player.hand.push(drawn)
  sortTiles(player.hand)
  appendLog(state, `${player.name} 摸牌`)

  return state
}

function settleMingGangScore(state: GameState, actor: number, from: number) {
  state.players[actor].score += 1
  state.players[from].score -= 1
}

function settleAnOrBuGangScore(state: GameState, actor: number) {
  for (let i = 0; i < state.players.length; i += 1) {
    if (i === actor) {
      continue
    }
    state.players[i].score -= 1
    state.players[actor].score += 1
  }
}

function getAnGangOptions(player: PlayerState): Tile[] {
  const counts = countTiles(player.hand)
  return TILE_TYPES.filter((tile) => counts[tile] === 4)
}

function getBuGangOptions(player: PlayerState): Tile[] {
  return player.melds
    .filter((meld) => meld.type === 'peng')
    .map((meld) => meld.tile)
    .filter((tile) => countTile(player.hand, tile) >= 1)
}

function tryEvaluateStandardHu(hand: Tile[], melds: Meld[]) {
  const openMeldCount = melds.length
  const meldNeed = 4 - openMeldCount
  const required = meldNeed * 3 + 2

  if (meldNeed < 0 || hand.length !== required) {
    return {
      standardWin: false,
      duiduihu: false,
    }
  }

  const counts = toCountArray(hand)
  let standardWin = false
  let duiduihu = false

  for (let i = 0; i < counts.length; i += 1) {
    if (counts[i] < 2) {
      continue
    }

    counts[i] -= 2

    if (canFormMelds(counts, meldNeed)) {
      standardWin = true
    }

    if (canFormTripletsOnly(counts, meldNeed)) {
      duiduihu = true
    }

    counts[i] += 2

    if (standardWin && duiduihu) {
      break
    }
  }

  return {
    standardWin,
    duiduihu,
  }
}

export function evaluateHu(hand: Tile[], melds: Meld[]): HuResult | null {
  const sortedHand = [...hand]
  sortTiles(sortedHand)

  const qidui = isQiDui(sortedHand, melds)
  const { standardWin, duiduihu } = tryEvaluateStandardHu(sortedHand, melds)

  if (!qidui && !standardWin) {
    return null
  }

  const qingyise = isQingYiSe(sortedHand, melds)

  let type: HuType = 'pinghu'
  if (qingyise) {
    type = 'qingyise'
  } else if (duiduihu) {
    type = 'duiduihu'
  } else if (qidui) {
    type = 'qidui'
  }

  return {
    type,
    baseFan: FAN_BY_HU_TYPE[type],
  }
}

function isQiDui(hand: Tile[], melds: Meld[]) {
  if (melds.length > 0 || hand.length !== 14) {
    return false
  }

  const counts = countTiles(hand)
  let pairCount = 0

  for (const tile of TILE_TYPES) {
    const value = counts[tile]
    if (value === 0) {
      continue
    }

    if (value % 2 !== 0) {
      return false
    }

    pairCount += value / 2
  }

  return pairCount === 7
}

function isQingYiSe(hand: Tile[], melds: Meld[]) {
  const tiles = [...hand, ...melds.map((meld) => meld.tile)]
  if (tiles.length === 0) {
    return false
  }

  const firstSuit = tileSuit(tiles[0])
  return tiles.every((tile) => tileSuit(tile) === firstSuit)
}

function canFormMelds(counts: number[], meldNeed: number) {
  const memo = new Map<string, boolean>()

  const dfs = (need: number): boolean => {
    if (need === 0) {
      return counts.every((value) => value === 0)
    }

    const key = `${need}|${counts.join(',')}`
    const memoValue = memo.get(key)
    if (typeof memoValue === 'boolean') {
      return memoValue
    }

    let first = -1
    for (let i = 0; i < counts.length; i += 1) {
      if (counts[i] > 0) {
        first = i
        break
      }
    }

    if (first === -1) {
      memo.set(key, need === 0)
      return need === 0
    }

    let success = false

    if (counts[first] >= 3) {
      counts[first] -= 3
      success = dfs(need - 1)
      counts[first] += 3
      if (success) {
        memo.set(key, true)
        return true
      }
    }

    const rank = first % 9
    if (rank <= 6 && counts[first + 1] > 0 && counts[first + 2] > 0) {
      counts[first] -= 1
      counts[first + 1] -= 1
      counts[first + 2] -= 1
      success = dfs(need - 1)
      counts[first] += 1
      counts[first + 1] += 1
      counts[first + 2] += 1
      if (success) {
        memo.set(key, true)
        return true
      }
    }

    memo.set(key, false)
    return false
  }

  return dfs(meldNeed)
}

function canFormTripletsOnly(counts: number[], meldNeed: number) {
  const total = counts.reduce((sum, value) => sum + value, 0)
  if (total !== meldNeed * 3) {
    return false
  }

  return counts.every((value) => value % 3 === 0)
}

function pickAIDiscard(player: PlayerState): Tile {
  const counts = countTiles(player.hand)
  let bestTile = player.hand[0]
  let bestScore = -Infinity

  for (const tile of player.hand) {
    const score = evaluateDiscardScore(tile, counts)
    if (score > bestScore) {
      bestScore = score
      bestTile = tile
    }
  }

  return bestTile
}

function evaluateDiscardScore(tile: Tile, counts: Record<Tile, number>) {
  const suit = tileSuit(tile)
  const rank = tileRank(tile)
  const selfCount = counts[tile]

  let score = 0

  if (selfCount >= 2) {
    score -= 2
  }

  const prev1 = rank > 1 ? counts[`${suit}${rank - 1}` as Tile] : 0
  const next1 = rank < 9 ? counts[`${suit}${rank + 1}` as Tile] : 0
  const prev2 = rank > 2 ? counts[`${suit}${rank - 2}` as Tile] : 0
  const next2 = rank < 8 ? counts[`${suit}${rank + 2}` as Tile] : 0

  if (prev1 > 0) {
    score -= 1
  }
  if (next1 > 0) {
    score -= 1
  }
  if (prev2 > 0) {
    score -= 0.35
  }
  if (next2 > 0) {
    score -= 0.35
  }

  if (selfCount === 1 && prev1 === 0 && next1 === 0) {
    score += 2
  }

  if (rank === 1 || rank === 9) {
    score += 1
  } else if (rank === 2 || rank === 8) {
    score += 0.5
  }

  score += tileIndex(tile) * 0.0001
  return score
}

function appendLog(state: GameState, message: string) {
  state.logs.unshift(message)
  if (state.logs.length > MAX_LOGS) {
    state.logs = state.logs.slice(0, MAX_LOGS)
  }
}

function nextPlayer(index: number) {
  return (index + 1) % 4
}

function removeTiles(hand: Tile[], tile: Tile, count: number) {
  let remaining = count

  for (let i = hand.length - 1; i >= 0; i -= 1) {
    if (hand[i] === tile) {
      hand.splice(i, 1)
      remaining -= 1
      if (remaining === 0) {
        return true
      }
    }
  }

  return false
}

function countTile(hand: Tile[], tile: Tile) {
  let count = 0
  for (const item of hand) {
    if (item === tile) {
      count += 1
    }
  }
  return count
}

function countTiles(hand: Tile[]) {
  const counts = Object.fromEntries(TILE_TYPES.map((tile) => [tile, 0])) as Record<
    Tile,
    number
  >

  for (const tile of hand) {
    counts[tile] += 1
  }

  return counts
}

function toCountArray(hand: Tile[]) {
  const counts = Array.from({ length: 27 }, () => 0)

  for (const tile of hand) {
    counts[tileIndex(tile)] += 1
  }

  return counts
}

function tileSuit(tile: Tile): Suit {
  return tile[0] as Suit
}

function tileRank(tile: Tile): number {
  return Number(tile.slice(1))
}

function tileIndex(tile: Tile): number {
  const suitOffset = tileSuit(tile) === 'W' ? 0 : tileSuit(tile) === 'T' ? 9 : 18
  return suitOffset + tileRank(tile) - 1
}

function sortTiles(tiles: Tile[]) {
  tiles.sort((a, b) => tileIndex(a) - tileIndex(b))
}

function cloneState(state: GameState): GameState {
  return structuredClone(state)
}
