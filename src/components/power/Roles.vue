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
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdBottom', i1 === 0 ? 'bdTop' : '', 'vCenter']" v-for="(item1, i1) in scope.row.children"
                    :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环 嵌套渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdTop', 'vCenter']" v-for="(item2, i2) in item1.children"
                        :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id"
                            closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showRoleEditDialog(scope.row.id)">编辑
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除
            </el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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

    <!-- 分配角色权限 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all
               :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
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
        },
        // 控制分配角色权限对话框的显示与隐藏
        setRightDialogVisible: false,
        // 所有权限列表
        rightsList: [],
        // 分配角色权限的树形控件的属性绑定对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        // 分配角色权限的树形控件 默认选中的节点ID值数组
        defKeys: [],
        // 当前即将分配权限的角色ID
        roleId: ''
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
          return this.$message.error('获取数据失败！')
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
            return this.$message.error('添加角色失败！')
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
            return this.$message.error('修改角色信息失败！')
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
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除！')
        }
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除角色失败！')
        }
        this.$message.success('删除角色成功！')
        this.getRolesList()
      },
      // 根据id删除对应权限
      async removeRightById(role, rightId) {
        // 询问用户是否删除数据
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('取消删除！')
        }
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除角色权限失败！')
        }
        this.$message.success('删除角色权限成功！')
        role.children = res.data
      },
      // 展示分配角色权限的对话框
      async showSetRightDialog(role) {
        this.roleId = role.id
        // 获取所有权限的数据
        const { data: res } = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) {
          return this.$message.error('获取权限列表失败！')
        }
        this.rightsList = res.data
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      },
      // 通过递归的形式，获取角色下所有三级权限的ID值，并保存到 defKeys 数组中
      getLeafKeys(node, arr) {
        // 如果当前节点不包含 children 属性，则是三级节点
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => this.getLeafKeys(item, arr))
      },
      // 监听分配角色权限对话框的关闭事件
      setRightDialogClosed() {
        this.defKeys = []
      },
      // 点击确定 保存选中权限
      async allotRights() {
        // ...为ES6扩展操作符，将数组或者对象合并成一个数组或者对象
        // 这里 key 值为一个包含所有已选中的权限ID 和 所有半选状态的权限ID
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        // 将数组变成以英文逗号分隔的字符串，传到api接口中，用于保存角色权限
        const idStr = keys.join(',')
        const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
        if (res.meta.status !== 200) {
          return this.$message.error('分配权限失败！')
        }
        this.$message.success('分配权限成功！')
        this.getRolesList()
        this.setRightDialogVisible = false
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdTop {
    border-top: 1px solid #eee;
  }

  .bdBottom {
    border-bottom: 1px solid #eee;
  }

  .vCenter {
    display: flex;
    align-items: center;
  }
</style>
