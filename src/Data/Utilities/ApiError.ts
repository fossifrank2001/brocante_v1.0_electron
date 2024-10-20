class ApiError {
    status: number;
    message: string;
    data: never | NonNullable<unknown>;

    constructor(status: number, message: string, data: never | NonNullable<unknown> = null) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    toString(): string {
        return `Error ${this.status}: ${this.message}`;
    }
}

export default ApiError;
