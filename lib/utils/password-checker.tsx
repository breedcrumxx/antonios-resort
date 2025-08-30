
/**
 * 
 * @param password - string to be checked for quality
 * @returns - string of error, if no error, an empty string is returned
 */
export function passwordChecker(password: string) {

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const isMixed = hasLowercase && hasUppercase
  const hasSpecial = /[!@#$%^&*()\-_+={[}\]|\\:;"'<,>.?/]/.test(password);

  if (!isMixed) { // if the password is not mixed uppercase and lowercase
    return "Password must contain UPPERCASE and lowercase letters!"
  }
  if (!hasNumbers) { // if the password doesn't have number
    return "Password must contain numbers!"
  }
  if (!hasSpecial) { // if the password doesn't have specual chars
    return "Password must contain character symbols!"
  }

  return ""
}