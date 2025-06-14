import AuthModel from '../models/auth-model.js';
import RegisterView from '../views/register-view.js';

const RegisterPresenter = {
  async init(container) {
    RegisterView.render(container);

    RegisterView.bindSubmit(container, async (event) => {
      event.preventDefault();

      RegisterView.showFullLoader(container);

      const { name, email, password } = RegisterView.getElements(container);

      try {
        await AuthModel.register({
          name: name.value.trim(),
          email: email.value.trim(),
          password: password.value,
        });

        RegisterView.hideLoader(container);

        await RegisterView.showSuccessAlert('Pendaftaran berhasil! Silakan login.');

        RegisterView.redirectTo('#/login');
      } catch (error) {
        RegisterView.hideLoader(container, true);

        RegisterView.showErrorAlert(error.message);
      }
    });
  },
};

export default RegisterPresenter;
