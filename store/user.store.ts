import { Module, VuexModule, Action, Mutation } from 'vuex-module-decorators'
import { User } from '~/types/user.type'

@Module({
  name: 'user',
  stateFactory: true,
  namespaced: true,
})
class UserModule extends VuexModule {
  user: User | null = null
  isAuthenticated: Boolean = false

  @Mutation
  setUser(user: User) {
    this.user = user
  }

  @Action
  async getUserFromId(id: string) {
    const user = await fetch(`/user/${id}}`);
    user.json().then((response) => {
      this.setUser(response);
    });
  }
}

export { UserModule }
