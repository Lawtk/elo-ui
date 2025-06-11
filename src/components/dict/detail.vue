<template>
  <el-card>
    <!-- 表信息 -->
    <el-descriptions :title="logicTable.name">
      <el-descriptions-item label="表名">{{
        logicTable.tableName
      }}</el-descriptions-item>
      <el-descriptions-item label="注释">{{
        logicTable.comment
      }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag size="small">{{
          getCodeTableValue(logicTable.status, "logic_table_status")
        }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="数据库类型">
        <el-tag size="small">{{
          getCodeTableValue(logicTable.databaseType, "database_type")
        }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="数据库名称">{{
        logicTable.databaseName
      }}</el-descriptions-item>
    </el-descriptions>
    <!-- 操作栏 -->
    <div class="top_bar">
      <div>
        <span class="top_nav">表字段</span>
      </div>
      <div>
        <el-button
          v-if="viewMode == 'view'"
          type="warning"
          size="small"
          @click="wuhua"
          >物化</el-button
        >
        <el-button type="primary" size="small" @click="refushed"
          >刷新</el-button
        >
        <el-button
          v-if="viewMode == 'view'"
          type="success"
          size="small"
          @click="editField"
          >编辑</el-button
        >
        <template v-else>
          <el-button size="small" type="success" @click="addField"
            >新增</el-button
          >
          <el-button size="small" type="primary" @click="saveField"
            >保存</el-button
          >
          <el-button size="small" type="warning" @click="cancelEditField"
            >取消</el-button
          >
        </template>
      </div>
    </div>
    <!-- 主数据列表 -->
    <el-table :data="list" border header-cell-class-name="comm_table_header">
      <el-table-column label="操作" width="200" v-if="viewMode == 'edit'">
        <template #default="scope">
          <el-button size="small" type="primary" @click="up(scope.$index)">
            上移
          </el-button>
          <el-button size="small" type="primary" @click="down(scope.$index)">
            下移
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteItem(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
      <el-table-column type="index" label="序号"> </el-table-column>
      <el-table-column prop="name" label="字段名">
        <template #default="scope">
          <span v-if="viewMode == 'view'">{{ scope.row.name }}</span>
          <el-input
            v-else
            v-model="scope.row.name"
            @change="rowChange(scope.row, 'UPDATE')"
          />
        </template>
      </el-table-column>
      <el-table-column prop="fieldType" label="字段类型">
        <template #default="scope">
          <span
            v-if="viewMode == 'view'"
            v-html="formatData(scope.row.fieldType, databaseFieldType)"
          ></span>
          <el-select
            v-else
            v-model="scope.row.fieldType"
            @change="rowChange(scope.row, 'UPDATE')"
          >
            <el-option
              v-for="item in optionsMap.get(databaseFieldType)"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="dataType" label="数据类型">
        <template #default="scope">
          <span
            v-if="viewMode == 'view'"
            v-html="formatData(scope.row.dataType, 'data_type')"
          ></span>
          <el-select
            v-else
            v-model="scope.row.dataType"
            @change="rowChange(scope.row, 'UPDATE')"
          >
            <el-option
              v-for="item in optionsMap.get('data_type')"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="nullable" label="能否为空">
        <template #default="scope">
          <span
            v-if="viewMode == 'view'"
            v-html="formatData(scope.row.nullable, 'tof')"
          ></span>
          <el-select
            v-else
            v-model="scope.row.nullable"
            @change="rowChange(scope.row, 'UPDATE')"
          >
            <el-option
              v-for="item in optionsMap.get('tof')"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="length" label="长度">
        <template #default="scope">
          <span v-if="viewMode == 'view'">{{ scope.row.length }}</span>
          <el-input
            v-else
            v-model="scope.row.length"
            @change="rowChange(scope.row, 'UPDATE')"
          />
        </template>
      </el-table-column>
      <el-table-column prop="decimalLength" label="小数位">
        <template #default="scope">
          <span v-if="viewMode == 'view'">{{ scope.row.decimalLength }}</span>
          <el-input
            v-else
            v-model="scope.row.decimalLength"
            @change="rowChange(scope.row, 'UPDATE')"
          />
        </template>
      </el-table-column>
      <el-table-column prop="primaryKey" label="键">
        <template #default="scope">
          <span v-if="viewMode == 'view'">{{ scope.row.primaryKey }}</span>
          <el-checkbox
            v-else
            :checked="scope.row.primaryKey > 0"
            :label="scope.row.primaryKey == '0' ? '无' : scope.row.primaryKey"
            @change="rowChange(scope.row, 'UPDATE', setPrimaryKey)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="comment" label="注释">
        <template #default="scope">
          <span v-if="viewMode == 'view'">{{ scope.row.comment }}</span>
          <el-input
            v-else
            v-model="scope.row.comment"
            @change="rowChange(scope.row, 'UPDATE')"
          />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态"></el-table-column>
    </el-table>
  </el-card>
</template>
<script>
import { commQuery, getCodeTable } from "@/util/query";
import { ElMessageBox } from "element-plus";
export default {
  data() {
    return {
      model_url: "/dict/logicField",
      list: [],
      deletedList: [],
      queryParams: {},
      logicTable: {},
      viewMode: "view",
      databaseFieldType:"mysql_type",
      optionsMap: new Map(),
      hiddenData: true,
    };
  },
  created() {
    //处理路由参数
    const params = this.$route.query;
    this.queryParams.tableId = params.table_id;
    this.initPage();
  },
  mounted() {},
  methods: {
    refushed() {
      if (this.viewMode == "edit") {
        ElMessageBox.confirm("未保存的数据将会清除！", "提示", {
          confirmButtonText: "继续",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          this.getList();
        });
      } else {
        this.getList();
      }
    },
    wuhua() {
      commQuery("/dict/table/wuhua", { id: this.queryParams.tableId }).then(
        (res) => {
          if (res.success) {
            console.log(1);
          }
        }
      );
    },
    getList() {
      commQuery(this.model_url + "/queryList", this.queryParams).then((res) => {
        if (res.success) {
          this.list = res.data;
        }
      });
    },
    getTableInfo() {
      commQuery("/dict/table/queryDetail", {
        id: this.queryParams.tableId,
      }).then((res) => {
        if (res.success) {
          this.logicTable = res.data;
          this.setDatabaseFieldType(this.logicTable.databaseType)
        }
      });
    },
    setDatabaseFieldType(e){
      switch(e){
        case "mysql":this.databaseFieldType="mysql_type";break;
        case "oracle":this.databaseFieldType="oracle_type";break;
      }
    },
    initPage() {
      this.setOptionMap();
      this.setCodeTable();
      this.getTableInfo();
      this.getList();
    },
    setOptionMap() {
      this.optionsMap.set("logic_table_status", []);
      this.optionsMap.set("data_type", []);
      this.optionsMap.set("tof", []);
      this.optionsMap.set("mysql_type", []);
      this.optionsMap.set("oracle_type", []);
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
    getCodeTableValue(value, code) {
      let res = "";
      let option = this.optionsMap.get(code);
      let temp = option.find((x) => x.value == value);
      if (temp) {
        res = temp.label;
      }
      return res;
    },
    editField() {
      this.viewMode = "edit";
    },
    addField() {
      let newItem = {
        tableId: this.queryParams.tableId,
        name: "field" + (this.list.length + 1),
        comment: "注释" + (this.list.length + 1),
        dataStatus: "ADD",
        serial: this.list.length + 1,
        primaryKey: 0,
        nullable: "1",
        dataType: "string",
        length: 255,
        decimalLength: 0,
      };
      this.list.push(newItem);
    },
    saveField() {
      //处理数据
      this.list.forEach((x, i) => {
        //变序状态
        if (x.serial !== i + 1 && x.dataStatus == "ORIGIN") {
          x.dataType = "UPDATE";
        }
      });
      commQuery(
        this.model_url + "/save",
        this.list.concat(this.deletedList)
      ).then((res) => {
        if (this.logicTable.status == "1") {
          commQuery("/dict/table/changeStatus", {
            id: this.queryParams.tableId,
            status: "2",
          }).then((res) => {
            this.getTableInfo();
          });
        }
        this.viewMode = "view";
        this.getList();
      });
    },
    cancelEditField() {
      this.viewMode = "view";
      this.getList();
    },
    up(index) {
      let i = index - 1;
      if (i < 0) {
        return;
      }
      this.swapElements(this.list, i, index);
    },
    down(index) {
      let i = index + 1;
      if (i >= this.list.length) {
        return;
      }
      this.swapElements(this.list, i, index);
    },
    setPrimaryKey(row) {
      if (row.primaryKey > 0) {
        this.list.forEach((x) => {
          if (x.primaryKey > row.primaryKey) {
            x.primaryKey--;
          }
        });
        row.primaryKey = 0;
      } else {
        row.nullable = "0";
        let temp = this.list.filter((x) => x.primaryKey > 0);
        row.primaryKey = temp ? temp.length + 1 : 1;
      }
    },
    // 交换数组 arr 中 index1 和 index2 的元素位置
    swapElements(arr, index1, index2) {
      [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
    },
    deleteItem(index) {
      //删除元素
      let deletedItem = this.list.splice(index, 1)[0];
      //非新增数据，加入删除数组
      if (deletedItem.dataStatus != "ADD") {
        deletedItem.dataStatus = "DELETE";
        this.deletedList.push(deletedItem);
      }
    },
    rowChange(row, dataStatus, fun) {
      //标记修改状态
      switch (dataStatus) {
        case "ADD":
          row.dataStatus = dataStatus;
          break;
        case "UPDATE":
          if (row.dataStatus != "ADD") {
            row.dataStatus = dataStatus;
          }
          break;
        case "DELETE":
          row.dataStatus = dataStatus;
          break;
      }
      //可传入一个方法回调
      if (fun) {
        fun(row);
      }
    },
  },
};
</script>
<style scoped></style>
