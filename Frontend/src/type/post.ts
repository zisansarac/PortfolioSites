export type PostItem = {
    id: number;
    title: string;
    slug: string;
    content: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt?: string | null;
    authorId: string;
    authorEmail?:string | null;
    authorFullName?:string | null;
    authorAvatarUrl?:string | null;
}

export type PostCreateRequest = {
    title: string;
    content: string;
    isPublished: boolean;
}

export type PostUpdateRequest = PostCreateRequest;