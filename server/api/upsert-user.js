const Clerk = require('@clerk/clerk-sdk-node');
const { Profile } = require('../models'); // Adjust path as needed

const CLERK_API_KEY = process.env.CLERK_API_KEY;

const clerk = new Clerk({ apiKey: CLERK_API_KEY });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const clerkUser = await clerk.users.getUser(userId);
    if (!clerkUser) return res.status(404).json({ error: 'user not found' });

    const user = clerkUser;
    const email = user.email_addresses?.[0]?.email_address || user.email || null;
    const email_verified = !!(user.email_addresses?.[0]?.verification?.status === 'verified') || !!user.email_verified;
    const phone = user.phone_numbers?.[0]?.phone_number || user.phone || null;
    const first_name = user.first_name || user.firstName || null;
    const last_name = user.last_name || user.lastName || null;
    const fullname = user.full_name || user.fullName || [first_name, last_name].filter(Boolean).join(' ') || null;
    const avatar_url = user.profile_image_url || user.image_url || null;
    const providers = Array.isArray(user.external_accounts) ? user.external_accounts.map(p => p.provider || p.provider_type).filter(Boolean) : [];
    const metadata = { ...(user.public_metadata || {}), ...(user.private_metadata || {}) };

    const profileData = {
      clerk_id: userId,
      email,
      email_verified,
      phone,
      first_name,
      last_name,
      fullname,
      avatar_url,
      providers: providers.length ? providers : [],
      metadata: Object.keys(metadata).length ? metadata : {},
      clerk_raw: user,
      updated_at: new Date()
    };

    // Check if profile exists
    const existing = await Profile.findOne({ where: { clerk_id: userId } });

    if (existing) {
      await existing.update(profileData);
    } else {
      await Profile.create(profileData);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('upsert-user error', err);
    return res.status(500).json({ error: 'internal' });
  }
};