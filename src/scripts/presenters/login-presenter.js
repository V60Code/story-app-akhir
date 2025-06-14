import AuthModel from '../models/auth-model.js';
import LoginView from '../views/login-view.js';

const LoginPresenter = {
  async init(container) {
    LoginView.render(container);

    LoginView.bindSubmit(container, async (event) => {
      event.preventDefault();

      LoginView.showFullLoader(container);

      const { email, password } = LoginView.getElements(container);

      try {
        const result = await AuthModel.login({
          email: email.value.trim(),
          password: password.value,
        });

        LoginView.hideLoader(container);

        await LoginView.showSuccessAlert(`Selamat datang, ${result.loginResult.name}`);

        LoginView.redirectTo('#/');
      } catch (error) {
        LoginView.hideLoader(container, true);

        LoginView.showErrorAlert(error.message);
      }
    });
  },
};

export default LoginPresenter;
