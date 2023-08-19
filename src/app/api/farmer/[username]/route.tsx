export async function GET(request: Request, context: { params: { username: string }}) {
    const username = context.params.username;
}