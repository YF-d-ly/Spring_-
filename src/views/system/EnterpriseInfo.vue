<template>
  <div class="enterprise-info">
    <el-card>
      <div slot="header" class="clearfix">
        <span>企业基本信息管理</span>
      </div>
      
      <el-form 
        :model="enterpriseForm" 
        :rules="enterpriseRules" 
        ref="enterpriseForm" 
        label-width="120px"
        style="max-width: 600px;"
      >
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="enterpriseForm.name" placeholder="请输入企业名称"></el-input>
        </el-form-item>
        <el-form-item label="具体地址" prop="address">
          <el-input v-model="enterpriseForm.address" placeholder="请输入企业地址"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contact_person">
          <el-input v-model="enterpriseForm.contact_person" placeholder="请输入联系人"></el-input>
        </el-form-item>
        <el-form-item label="联系方式" prop="contact_phone">
          <el-input v-model="enterpriseForm.contact_phone" placeholder="请输入联系方式"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveEnterpriseInfo">保存</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'EnterpriseInfoPage',
  data() {
    return {
      enterpriseForm: {
        name: '',
        address: '',
        contact_person: '',
        contact_phone: ''
      },
      enterpriseRules: {
        name: [
          { required: true, message: '请输入企业名称', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入企业地址', trigger: 'blur' }
        ],
        contact_person: [
          { required: true, message: '请输入联系人', trigger: 'blur' }
        ],
        contact_phone: [
          { required: true, message: '请输入联系方式', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$|^(\d{3,4}-?)?\d{7,8}$/, message: '请输入正确的手机号码或电话号码', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchEnterpriseInfo();
  },
  methods: {
    // 获取企业信息
    async fetchEnterpriseInfo() {
      // 模拟API调用
      setTimeout(() => {
        // 模拟企业数据
        this.enterpriseForm = {
          id: 1,
          name: '厦门理工学院仓储有限公司',
          address: '福建省厦门市集美区理工路600号',
          contact_person: '李经理',
          contact_phone: '0592-1234567'
        };
      }, 300);
    },
    
    // 保存企业信息
    async saveEnterpriseInfo() {
      try {
        await this.$refs.enterpriseForm.validate();
        
        // 模拟API调用
        setTimeout(() => {
          this.$message.success('企业信息保存成功');
        }, 500);
      } catch (error) {
        this.$message.error('表单验证失败');
      }
    },
    
    // 重置表单
    resetForm() {
      this.fetchEnterpriseInfo();
    }
  }
}
</script>

<style scoped>
.enterprise-info {
  padding: 20px;
}
</style>