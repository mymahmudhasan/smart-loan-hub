Add password show/hide toggle (eye icon) to all password input fields across the app.

### Scope
1. **Login page** (`/login`) — password field
2. **Signup page** (`/signup`) — password + confirm password fields
3. **Admin login page** (`/admin-login`) — password field

### Implementation
- Add a `showPassword` boolean state per password field.
- Wrap each password `<Input>` in a `relative` container.
- Place an absolute-positioned toggle button at the right end of the input.
- Use `Eye` and `EyeOff` icons from `lucide-react`.
- Toggle the `<Input>` `type` between `"password"` and `"text"`.
- Ensure the toggle button is accessible (aria-label) and does not interfere with input focus.

### No other changes
- Form submission logic, validation, and styling remain unchanged.
- No backend or database changes.