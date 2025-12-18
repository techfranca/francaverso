import { createServerClient } from './supabase/server'

export async function getUserFromSession() {
  const supabase = createServerClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Buscar dados completos do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return null
    }

    return userData
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function validatePassword(password) {
  return password === process.env.APP_PASSWORD
}