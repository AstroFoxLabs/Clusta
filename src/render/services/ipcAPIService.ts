type IpcError = { success: false; error: string };
// Handle void functions by making data optional in the success case
type IpcSuccess<T> = T extends void ? { success: true } : { success: true; data: T };
type IpcResponse<T> = IpcSuccess<T> | IpcError;
type IPCFunc<TRes> = () => Promise<IpcResponse<TRes>>;

export const ipcAPI = async <T>(fn: IPCFunc<T>): Promise<T> => {
    const res = await fn();

    if (!res.success) {
        throw new Error(res.error);
    }

    // console.log('IPC API call successful:', res);

    // Return the data if present, otherwise undefined for void
    if ('data' in res) {
        return res.data;
    } else {
        return undefined as unknown as T; // Cast undefined to T for void functions
    }
};
