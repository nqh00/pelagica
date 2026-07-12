export async function loginToSeerr(server: string, username: string, password: string): Promise<void> {
    try {
        await fetch('/api/seerr/login?jellyfin_url=' + encodeURIComponent(server), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });
    } catch (e) {
        // seerr login is best effort and shouldn't block jellyfin login
        console.warn('Seerr login failed:', e);
    }
}
