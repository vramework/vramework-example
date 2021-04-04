const sixCharsOneUppercaseOneLowerCase = /^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]{6,}$/

export const validatePassword = (password: string) => {
  return sixCharsOneUppercaseOneLowerCase.test(password)
}
