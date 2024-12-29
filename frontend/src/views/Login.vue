<template>
  <div class="login">
    <v-card class="pa-4" max-width="400" margin="auto">
      <v-card-title>{{ isRegister ? '注册' : '登录' }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="username"
            label="用户名"
            required
          ></v-text-field>
          
          <v-text-field
            v-model="password"
            label="密码"
            type="password"
            required
          ></v-text-field>

          <v-btn
            type="submit"
            color="primary"
            block
            class="mt-4"
          >
            {{ isRegister ? '注册' : '登录' }}
          </v-btn>
        </v-form>

        <v-btn
          text
          block
          class="mt-2"
          @click="isRegister = !isRegister"
        >
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      isRegister: false
    }
  },

  methods: {
    async handleSubmit() {
      try {
        if (!this.username || !this.password) {
          this.$toast.error('请输入用户名和密码');
          return;
        }

        const endpoint = this.isRegister ? '/api/auth/register' : '/api/auth/login';
        console.log('Sending request to:', endpoint);
        
        const response = await this.$axios.post(endpoint, {
          username: this.username,
          password: this.password
        });

        console.log('Response:', response.data);

        if (this.isRegister) {
          this.$toast.success('注册成功，请登录');
          this.isRegister = false;
          this.password = ''; // 清空密码
        } else {
          const { token, user } = response.data;
          if (!token || !user) {
            throw new Error('登录成功但未收到完整的用户信息');
          }
          
          // 存储用户信息
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // 设置 axios 默认头部
          this.$axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          this.$toast.success(`欢迎回来，${user.role === 'admin' ? '管理员' : '用户'}${user.username}`);
          
          // 根据角色跳转到不同页面
          const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
          this.$router.push(redirectPath);
        }
      } catch (error) {
        console.error('Login error:', error);
        console.error('Error response:', error.response);
        const message = error.response?.data?.message || 
                       (error.response?.status === 401 ? '用户名或密码错误' : 
                       (error.response?.status === 404 ? 'API接口未找到' : '登录失败，请稍后重试'));
        this.$toast.error(message);
      }
    }
  }
}
</script> 