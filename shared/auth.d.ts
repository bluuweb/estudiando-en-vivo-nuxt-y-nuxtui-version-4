// https://github.com/atinux/nuxt-auth-utils/pull/437/commits/6811ec5aedd78ec51739fea55002701a7d5ae8e1
declare module "#auth-utils" {
  interface User {
    name: string;
    email: string;
  }

  interface UserSession {
    user: User;
    loggedInAt: number;
  }
}

export {};
