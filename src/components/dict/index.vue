<template>
  <el-card>
    <el-form :inline="true" :model="queryParams" label-width="auto">
      <el-form-item label="名称">
        <el-input v-model="queryParams.name"></el-input>
      </el-form-item>
      <el-form-item label="表名称">
        <el-input v-model="queryParams.tabelName"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
        <el-button type="success" @click="openDialog">新建</el-button>
      </el-form-item>
    </el-form>
    <!-- 主表单——字段列表 -->
    <el-table :data="list" border>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="edit(scope.row)"> 编辑 </el-button>
          <el-button size="small" type="danger" @click="del(scope.row)">
            删除
          </el-button>
          <el-button size="small" type="primary" @click="config(scope.row)">
            配置
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="tableName" label="表名"></el-table-column>
      <el-table-column prop="comment" label="注解"></el-table-column>
      <el-table-column prop="databaseType" label="数据库类型"></el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <span
            v-html="formatData(scope.row.status, 'logic_table_status')"
          ></span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <el-dialog v-model="dialogVisible" title="编辑表信息" width="500" center>
    <el-form :model="logicTable" label-width="auto">
      <el-form-item label="名称">
        <el-input v-model="logicTable.name"></el-input>
      </el-form-item>
      <el-form-item label="表名称">
        <el-input v-model="logicTable.tableName"></el-input>
      </el-form-item>
      <el-form-item label="注解">
        <el-input v-model="logicTable.comment"></el-input>
      </el-form-item>
      <el-form-item label="数据源">
        <el-select v-model="logicTable.dataSourceId" @change="changeDataSource">
          <el-option
            v-for="item in dataSourceOptions"
            :key="item.id"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </el-select>
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
import { commQuery, getCodeTable, getDataSourceList } from "@/util/query";
export default {
  data() {
    return {
      model_url: "dict/table",
      list: [],
      saveMode: "add", //add update
      logicTable: {},
      dialogVisible: false,
      pageParams: {
        pageSize: 20,
        pageNum: 1,
      },
      queryParams: {
        name: "",
        tabelName: "",
      },
      optionsMap: new Map(),
    };
  },
  mounted() {
    this.initPage();
  },
  methods: {
    initPage() {
      this.setOptionMap();
      this.setCodeTable();
      this.getList();
    },
    setOptionMap() {
      this.optionsMap.set("logic_table_status", []);
    },
    setCodeTable() {
      let that = this;
      this.optionsMap.forEach((value, key) => {
        getCodeTable(key).then((res) => {
          that.optionsMap.set(key, res.data);
        });
      });
      getDataSourceList().then((res) => {
        if (res.success) {
          this.dataSourceOptions = res.data;
        }
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
      this.logicTable = {};
    },
    changeDataSource(e) {
      let temp = this.dataSourceOptions.find((x) => x.value == e);
      this.logicTable.databaseType = temp.databaseType;
      this.logicTable.databaseName = temp.databaseName;
      console.log(this.logicTable)
    },
    save() {
      if (this.saveMode === "add") {
        commQuery(this.model_url + "/add", this.logicTable).then((res) => {
          this.dialogVisible = false;
          this.getList();
        });
      } else if (this.saveMode === "update") {
        commQuery(this.model_url + "/update", this.logicTable).then((res) => {
          this.dialogVisible = false;
          this.getList();
        });
      }
    },
    edit(row) {
      this.logicTable = row;
      this.dialogVisible = true;
      this.saveMode = "update";
    },
    del(row) {
      this.logicTable = row;
      commQuery(this.model_url + "/delete", this.logicTable).then((res) => {
        this.getList();
      });
    },
    config(row) {
      this.$router.push({ path: "/detail", query: { table_id: row.id } });
    },
    formatData(value, code, needColor = true) {
      let res = "";
      let option = this.optionsMap.get(code);
      let temp = option.find((x) => x.value == value);
      if (temp) {
        res = `<span ${
          needColor && temp.color ? 'style="color:' + temp.color + '"' : ""
        }>${temp.label}</span>`;
      }
      return res;
    },
  },
};
</script>
<style scoped></style>
