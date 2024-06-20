class ApiError {
    status: number;
    message: string;
    data: any | null;

    constructor(status: number, message: string, data: any | null = null) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    toString(): string {
        return `Error ${this.status}: ${this.message}`;
    }
}

export default ApiError;
