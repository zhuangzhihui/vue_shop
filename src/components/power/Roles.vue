<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand"></el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showRoleEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加角色 -->
      <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleDialogClosed">
        <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="90px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改角色 -->
      <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible" width="50%" @close="editRoleDialogClosed">
        <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="90px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'Roles',
    data() {
      return {
        // 角色列表数据
        roleList: [],
        // 控制添加角色的显示与隐藏
        addRoleDialogVisible: false,
        // 添加角色的表单数据
        addRoleForm: {
          roleName: '',
          roleDesc: ''
        },
        // 添加角色表单的验证规则对象
        addRoleFormRules: {
          roleName: [
            { required: true, message: '请输入角色名', trigger: 'blur' }
          ],
          roleDesc: [
            { required: true, message: '请输入角色描述', trigger: 'blur' }
          ]
        },
        // 控制修改角色的显示与隐藏
        editRoleDialogVisible: false,
        // 修改角色的表单数据 根据ID从后台获取数据
        editRoleForm: {},
        // 修改角色表单的验证规则对象
        editRoleFormRules: {
          roleName: [
            { required: true, message: '请输入角色名', trigger: 'blur' }
          ],
          roleDesc: [
            { required: true, message: '请输入角色描述', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getRolesList()
    },
    methods: {
      // 获取角色列表数据
      async getRolesList() {
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          this.$message.error('获取数据失败！')
        }
        this.roleList = res.data
      },
      // 监听添加角色对话框的关闭事件
      addRoleDialogClosed() {
        this.$refs.addRoleFormRef.resetFields()
      },
      // 预验证添加角色表单 => 添加角色
      addRole() {
        this.$refs.addRoleFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('roles', this.addRoleForm)
          if (res.meta.status !== 201) {
            this.$message.error('添加角色失败！')
          }
          this.$message.success('添加角色成功！')
          this.addRoleDialogVisible = false
          this.getRolesList()
        })
      },
      // 展示编辑角色的对话框
      async showRoleEditDialog(id) {
        const { data: res } = await this.$http.get('roles/' + id)
        this.editRoleDialogVisible = true
        this.editRoleForm = res.data
      },
      // 监听修改角色对话框的关闭事件
      editRoleDialogClosed() {
        this.$refs.editRoleFormRef.resetFields()
      },
      // 预验证表单信息 => 修改角色信息并提交
      editRoleInfo() {
        this.$refs.editRoleFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId, {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          })
          if (res.meta.status !== 200) {
            this.$message.error('修改角色信息失败！')
          }
          this.$message.success('修改角色信息成功！')
          this.editRoleDialogVisible = false
          this.getRolesList()
        })
      },
      // 根据ID删除对应的角色
      async removeRoleById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(res => res)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除！')
        }
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          this.$message.error('删除角色失败！')
        }
        this.$message.success('删除角色成功！')
        this.getRolesList()
      }
    }
  }
</script>

<style lang="less" scoped>
</style>
