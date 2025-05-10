export type Student = {
  name: string
  id: string
}

export type StudentWeight = {
  studentId: string
  weight: number
}

export type AppSettings = {
  animationSpeed: number
  enableSound: boolean
  selectionMode: "random" | "weighted" | "sequential"
  avoidRepeat: boolean
  showStudentIds: boolean
  secretStudents: string[]
  selectionCount: number
  customSoundUrl: string
  studentWeights: StudentWeight[]
  alwaysSelectStudents: string[]
  neverSelectStudents: string[]
  // New settings
  animationDuration?: number
  nameSize?: number
  themeColor?: string
  darkMode?: boolean
  startKey?: string
  clearKey?: string
}

export type AppPage = "welcome" | "selector" | "import" | "settings" | "history" | "verify" | "admin"

export type MembershipInfo = {
  isMember: boolean
  username: string
  expiryDate: string | null
  verificationDate: string | null
  key: string
}

export type VerificationFile = {
  username: string
  key: string
  timestamp: number
  signature: string
}
