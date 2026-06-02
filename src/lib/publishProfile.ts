import { supabase } from '@/integrations/supabase/client';

export interface PublishInput {
  fullName: string;
  email: string;
  mobile: string;
  handle: string;
  selectedTemplate: string;
}

export interface PublishResult {
  url: string;
  shortUrl: string;
  profileId: string;
  handle: string;
}

export async function publishProfile(input: PublishInput): Promise<PublishResult> {
  const handle = input.handle.trim().toLowerCase();
  if (!handle) throw new Error('Handle is required');

  // Ensure we have a Supabase auth session (anonymous if none)
  let { data: sessionData } = await supabase.auth.getSession();
  let userId = sessionData.session?.user.id;

  if (!userId) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      throw new Error(error?.message || 'Could not create session');
    }
    userId = data.user.id;
  }

  // Upsert the profile under the authenticated uid (satisfies RLS)
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        handle,
        full_name: input.fullName.trim() || 'Anonymous',
        email: input.email.trim() || null,
        mobile: input.mobile.trim() || null,
        selected_template: input.selectedTemplate,
      },
      { onConflict: 'id' }
    );

  if (upsertError) {
    // Most likely: handle uniqueness collision
    throw new Error(
      upsertError.message.includes('duplicate')
        ? 'That handle was just taken. Please pick another.'
        : upsertError.message
    );
  }

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://link.merqato.digital';
  const url = `${origin}/${handle}`;
  const shortUrl = `link.merqato.digital/${handle}`;

  return { url, shortUrl, profileId: userId, handle };
}
