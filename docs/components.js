const sidebar = {
    id: 'sidebar',
    children: [
        {
            tag: 'input',
            type: 'checkbox',
            id: 'chevron-input',
            autocomplete: 'off'
        },
        {
            id: 'sidebar-upper',
            children: [
                {
                    id: 'chevron',
                    tag: 'label',
                    for: 'chevron-input',
                    innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>`
                },
                {
                    tag: 'a',
                    href: '/',
                    id: 'logo',
                    children: [{tag: 'span', children: '🥭'}, ' FRUIT UI']
                }
            ]
        },
        {
            id: 'sidebar-index',
            children: [
                { name: 'Fruit UI', url: '/' },
                { name: 'Test 1', url: '/' },
                { name: 'Some Stupid Shit, Such As Google Images', url: 'https://images.google.com/' },
            ].map(entry => ({
                tag: 'a',
                href: entry.url,
                children: entry.name
            }))
        }
    ]
}