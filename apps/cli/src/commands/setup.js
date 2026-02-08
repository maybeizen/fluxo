export const data = {
    name: 'setup',
    description: 'Run the initial setup wizard',
    usage: 'fluxo setup [options]',
    options: [],
    examples: ['fluxo setup'],
}

export async function execute(args, options) {
    console.log('Running initial setup wizard...')
    console.log(
        '(This is a placeholder. Configure your API URL, database, etc.)'
    )
}
