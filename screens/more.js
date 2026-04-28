/* =========================================================================
   /more — bottom-nav "More" hub.
   Account, help, and session entry points. Real entries route to live
   screens (/coming, /stock-how); the rest toast with their ETA, never
   alert. Overrides the placeholder registration for key 'more'.
   ========================================================================= */

window.Screens.more = {
  title: 'More',
  render(state) {
    const row = ({ icon, title, sub, action, trail = '›' }) => `
      <div class="list-item" onclick="${action}" role="button" tabindex="0">
        <div class="list-item-icon" style="background:var(--c-bg-soft);font-size:22px">${icon}</div>
        <div class="list-item-body">
          <p class="list-item-title">${title}</p>
          <p class="list-item-sub">${sub}</p>
        </div>
        <span class="text-subtle" style="font-size:18px;padding-right:4px">${trail}</span>
      </div>
    `;

    const sectionLabel = (label) =>
      `<p class="section-label-title" style="margin:18px 0 8px">${label}</p>`;

    return `
      <section class="screen">
        ${UI.header({ title: 'More' })}

        <div class="screen-body" style="padding-bottom:88px">

          ${sectionLabel('Help & info')}
          <div class="list">
            ${row({
              icon: '🗓️',
              title: "What's coming",
              sub: 'Roadmap of upcoming features',
              action: "navigate('/coming')",
            })}
            ${row({
              icon: '🔄',
              title: 'How stock works',
              sub: 'Why stock drops the moment you confirm an order',
              action: "navigate('/stock-how')",
            })}
          </div>

          ${sectionLabel('Account')}
          <div class="list">
            ${row({
              icon: '👤',
              title: 'Edit profile',
              sub: 'Change your store name, tagline, and brand colour',
              action: `UI.toast('Profile editing arrives in v1')`,
            })}
            ${row({
              icon: '🔔',
              title: 'Notifications',
              sub: 'Choose what pings you and when',
              action: `UI.toast('Notification settings arrive within 3 months')`,
            })}
            ${row({
              icon: '🌐',
              title: 'Language',
              sub: 'English · Shona · Ndebele',
              action: `UI.toast('Language switching arrives within 6 months')`,
            })}
          </div>

          ${sectionLabel('Session')}
          <div class="list">
            ${row({
              icon: '🚪',
              title: 'Sign out',
              sub: 'You can sign back in with your phone number',
              action: `UI.toast('Sign out arrives in v1')`,
            })}
          </div>

          <p class="text-xs text-subtle text-center" style="margin:28px 0 8px">
            urAfro · Sprint 0 demo · v0.1
          </p>
        </div>

        ${UI.tabBar('more')}
      </section>
    `;
  },
};
