export function getToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("currentUserId")
}

export function setToken(token: string) {
  localStorage.setItem("currentUserId", token)
}

export function clearToken() {
  localStorage.removeItem("currentUserId")
}

export function isLoggedIn() {
  return !!getToken()
}
