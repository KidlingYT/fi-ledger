// Types of the supabase database tables

export interface Expense {
    name: string;
    amount: number;
    category: string;
    sub_category: string;
    user_id: string;
    date: string;
}

export interface Earning {
    name: string;
    amount: number;
    category: string;
    sub_category: string;
    user_id: string;
    date: string;
}

export interface Ledger {
    expenses: Expense[];
    earnings: Earning[];
}
