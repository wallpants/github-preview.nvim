export type NeovimNotificationArgs = Array<{
    id: number;
    match: string;
    buf: number;
    file: string;
    event: string;
}>;

export type ServerMessage = {
    markdown?: string;
    goodbye?: true;
};
