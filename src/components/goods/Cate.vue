<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table class="treeTable"
                  :data="cateList"
                  :columns="columns"
                  :selection-type="false"
                  :expand-type="false"
                  show-index
                  index-text="#"
                  border>
        <!-- 是否有效 -->
        <template slot="isOK" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditCateDialog(scope.row.cat_id)">编辑
          </el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除
          </el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- :options指定数据源 -->
          <el-cascader v-model="selectedKeys" :options="parentCateList"
                       :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' }"
                       @change="parentCateChanged" clearable change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类的对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Cate',
    data() {
      return {
        // 商品分类查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 10
        },
        // 商品分类的数据
        cateList: [],
        // 总数据条目
        total: 0,
        // 为 Table 指定列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            // 将当前列 定义为 模板列（作用域插槽）
            type: 'template',
            // 指定当前列使用的 模板名称（插槽名称）
            template: 'isOK'
          },
          {
            label: '排序',
            // 将当前列 定义为 模板列（作用域插槽）
            type: 'template',
            // 指定当前列使用的 模板名称（插槽名称）
            template: 'order'
          },
          {
            label: '操作',
            // 将当前列 定义为 模板列（作用域插槽）
            type: 'template',
            // 指定当前列使用的 模板名称（插槽名称）
            template: 'opt'
          }
        ],
        // 控制添加分类的对话框
        addCateDialogVisible: false,
        // 添加分类的表单数据对象
        addCateForm: {
          cat_name: '',
          // 父级分类的ID
          cat_pid: 0,
          // 分类的等级，默认要添加的是一级分类
          cat_level: 0
        },
        // 添加分类的表单验证规则
        addCateFormRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' }
          ]
        },
        // 父级分类的数据列表
        parentCateList: [],
        // 选中的父级分类的ID数组
        selectedKeys: [],
        // 控制编辑分类对话框的显示与隐藏
        editCateDialogVisible: false,
        // 编辑分类的表单数据对象
        editCateForm: {},
        // 编辑分类的表单验证规则
        editCateFormRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      // 获取商品分类
      async getCateList() {
        const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类失败！')
        }
        this.cateList = res.data.result
        this.total = res.data.total
      },
      // 监听 pageSize 变化
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      // 监听 pagenum 的改变
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      // 展示添加分类的对话框
      showAddCateDialog() {
        // 先获取父级分类的数据列表 再弹出对话框
        this.getParentCateList()
        this.addCateDialogVisible = true
      },
      // 获取父级分类的数据列表
      async getParentCateList() {
        const { data: res } = await this.$http.get('categories', { primary: { type: 2 } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取父级分类失败！')
        }
        this.parentCateList = res.data
      },
      // 选择项发生变化出发的函数
      parentCateChanged() {
        // 如果selectedKeys的length大于0，则证明选中了父级分类，否则没有选择任何腹肌分类
        if (this.selectedKeys.length > 0) {
          // 父级分类的ID
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          // 为当前分类的等级赋值
          this.addCateForm.cat_level = this.selectedKeys.length
          // return
        } else {
          // 父级分类的ID
          this.addCateForm.cat_pid = 0
          // 为当前分类的等级赋值
          this.addCateForm.cat_level = 0
        }
      },
      // 添加新的分类
      addCate() {
        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败！')
          }
          this.$message.success('添加分了成功！')
          this.getCateList()
          this.addCateDialogVisible = false
        })
      },
      // 监听添加分类对话框的关闭事件
      addCateDialogClosed() {
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      },
      // 展示编辑分类的对话框
      async showEditCateDialog(id) {
        const { data: res } = await this.$http.get('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类信息失败！')
        }
        this.editCateForm = res.data
        this.editCateDialogVisible = true
      },
      // 编辑分类
      editCate() {
        this.$refs.editCateFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
            cat_name: this.editCateForm.cat_name
          })
          if (res.meta.status !== 200) {
            return this.$message.error('修改分类失败！')
          }
          this.$message.success('修改分类成功！')
          this.getCateList()
          this.editCateDialogVisible = false
        })
      },
      // 监听编辑分类对话框的关闭事件
      editCateDialogClosed() {
        this.$refs.editCateFormRef.resetFields()
      },
      // 根据ID删除对应分类
      async removeCateById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除！')
        }
        const { data: res } = await this.$http.delete('categories/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败！')
        }
        this.$message.success('删除分类成功！')
        this.getCateList()
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-icon-success {
    color: lightGreen;
  }

  .el-icon-error {
    color: red;
  }

  .treeTable {
    margin-top: 15px;
  }

  .el-cascader {
    width: 100%;
  }

</style>
