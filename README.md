# Proyecto de estudio con Nuxt 4

TODOS:

- [x] Revisar que cuando cambie la contraseña a través de email, la constraseña sea diferente a la anterior.
- [x] Guardar el usuario de github en la base de datos.
- [x] Vincular cuentas de redes sociales (Google, Facebook, etc.) al registro e inicio de sesión.
- [x] Falta arreglar la UI de inicio de sesion y registro.
- [ ] Qué el usuario pueda ver las cuentas vinculadas en su perfil y desvincularlas.
- [ ] Refactorizar código repetido en login y register (backend).

- [todo con Nuxt, Nuxt-auth-utils, drizzle](https://github.com/atinux/atidone)

## Vincular cuentas de redes sociales

1. Las cuentas de redes sociales tienen que tener el correo electrónico verificado. Y en el caso de vincular email y password, el correo electrónico también debe estar verificado.
2. Al vincular una cuenta de red social, se debe verificar que el correo electrónico de la cuenta de red social coincida con el correo electrónico del usuario en la plataforma.
3. Si el correo electrónico coincide, se vincula la cuenta de red social al usuario existente.
4. Si el correo electrónico no coincide, se debe crear una nueva cuenta de usuario o mostrar un mensaje de error indicando que el correo electrónico no coincide.
5. Implementar la funcionalidad para desvincular cuentas de redes sociales desde la configuración del usuario.
6. Asegurarse de que los usuarios puedan iniciar sesión utilizando cualquiera de las cuentas vinculadas.
7. Probar exhaustivamente la funcionalidad de vinculación y desvinculación de cuentas de redes sociales para garantizar que funcione correctamente en todos los escenarios posibles.
