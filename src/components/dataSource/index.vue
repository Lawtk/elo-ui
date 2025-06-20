<template>
  <el-card>
    <el-form :inline="true" :model="queryParams" label-width="auto">
      <el-form-item label="名称">
        <el-input v-model="queryParams.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
        <el-button type="success" @click="openDialog">新建</el-button>
      </el-form-item>
    </el-form>
    <div style="display: flex; flex-direction: row">
      <el-card
        v-for="item in list"
        shadow="hover"
        style="width: 280px; margin-right: 20px"
      >
        <template #header>
          <span>{{ item.name }} </span>
        </template>
        <p>用户名:{{ item.username }}</p>
        <p>密码:{{ item.password }}</p>
        <p>
          数据库类型:<el-tag size="small">{{ item.databaseType }}</el-tag>
        </p>
        <template #footer>
          <el-button size="small" @click="del(item)">删除</el-button>
          <el-button size="small" @click="edit(item)">编辑</el-button>
        </template>
      </el-card>
    </div>
  </el-card>
  <el-dialog v-model="dialogVisible" title="编辑表信息" width="800" center>
    <el-form :model="dataSource" label-width="auto">
      <el-form-item label="名称">
        <el-col :span="18">
          <el-form-item>
            <el-input v-model="dataSource.name"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="类型">
            <el-select v-model="dataSource.databaseType">
              <el-option
                v-for="item in optionsMap.get('database_type')"
                :key="item.id"
                :value="item.value"
                :label="item.label"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="用户名">
        <el-col :span="10">
          <el-form-item>
            <el-input v-model="dataSource.username"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-form-item label="密码">
            <el-input v-model="dataSource.password"></el-input>
          </el-form-item>
        </el-col>
      </el-form-item>

      <el-form-item label="主机">
        <el-col :span="8">
          <el-form-item>
            <el-input v-model="dataSource.host"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="端口">
            <el-input v-model="dataSource.port"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="数据库">
            <el-input v-model="dataSource.databaseName"></el-input>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="url">
        <el-input v-model="dataSource.url" type="textarea" :rows="4"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="save">保存</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          取消
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import { commQuery, getCodeTable } from "@/util/query";
export default {
  data() {
    return {
      model_url: "dict/dataSource",
      list: [],
      saveMode: "add", //add update
      dataSource: {},
      dialogVisible: false,
      pageParams: {
        pageSize: 20,
        pageNum: 1,
      },
      queryParams: {
        name: "",
      },
      optionsMap: new Map()
    };
  },
  mounted() {
    this.initPage();
  },
  methods: {
    //-------------------------
    initPage() {
      this.setOptionMap();
      this.setCodeTable();
      this.getList();
    },
    setOptionMap() {
      this.optionsMap.set("database_type", []);
    },
    setCodeTable() {
      let that = this;
      this.optionsMap.forEach((value, key) => {
        getCodeTable(key).then((res) => {
          that.optionsMap.set(key, res.data);
        });
      });
    },
    onSubmit() {
      this.getList();
    },
    getList() {
      commQuery(
        this.model_url + "/queryList",
        this.queryParams,
        this.pageParams
      ).then((res) => {
        if (res.success) {
          this.list = res.data.list;
        }
      });
    },
    openDialog() {
      this.dialogVisible = true;
      this.saveMode = "add";
      this.dataSource = {};
    },
    save() {
      if (this.saveMode === "add") {
        commQuery(this.model_url + "/add", this.dataSource).then((res) => {
          this.dialogVisible = false;
          this.getList();
        });
      } else if (this.saveMode === "update") {
        commQuery(this.model_url + "/update", this.dataSource).then((res) => {
          this.dialogVisible = false;
          this.getList();
        });
      }
    },
    edit(row) {
      this.dataSource = row;
      this.dialogVisible = true;
      this.saveMode = "update";
    },
    del(row) {
      this.dataSource = row;
      commQuery(this.model_url + "/delete", this.dataSource).then((res) => {
        this.getList();
      });
    },
    config(row) {
      let mode = row.status == "1" ? "edit" : "view";
      this.$router.push({ path: "/detail", query: { table_id: row.id } });
    },
  },
};
</script>
<style scoped>
.textarea-container {
  position: relative;
  margin: 15px 0;
}

.fixed-prefix {
  position: absolute;
  top: 8px;
  left: 10px;
  color: #7f8c8d;
  z-index: 2;
  pointer-events: none;
  user-select: none;
  font-size: 14px;
  line-height: 1.5;
}

.measure-span {
  position: absolute;
  visibility: hidden;
  white-space: pre;
  font-size: 14px;
}
</style>
