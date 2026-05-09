import { computed, ref } from "vue";
import { defineStore } from "pinia";

type UserRole = "USER" | "ADMIN";

export const useAuthStore = defineStore("auth", () => {
  const role = ref<UserRole | null>(null);

  const isAuthenticated = computed(() => role.value !== null);
  const isAdmin = computed(() => role.value === "ADMIN");
  const authState = computed(() => ({
    isAuthenticated: isAuthenticated.value,
    isAdmin: isAdmin.value,
  }));

  function setRole(nextRole: UserRole) {
    role.value = nextRole;
  }

  return {
    role,
    isAuthenticated,
    isAdmin,
    authState,
    setRole,
  };
});
