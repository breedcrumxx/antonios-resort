

export const validateEmail = (email: string) => {
  const validEmails = ['gmail.com', 'outlook.com', 'yahoo.com']

  const emailSubstring = email.split('@')[1]

  return validEmails.includes(emailSubstring)
}