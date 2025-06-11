<template>
    <el-card class="page">
        <div class="flex_r">
            <div>
                <div class="top_bar">
                    <el-radio-group v-model="queryParams.type" @change="changeType">
                        <el-radio-button label="全部" value="" />
                        <el-radio-button label="系统" value="1" />
                        <el-radio-button label="业务" value="2" />
                    </el-radio-group>
                    <el-button type="primary" @click="openDialog">新增</el-button>
                </div>
                <el-table ref="directoryTable" :data="list" border highlight-current-row
                    @current-change="handleCurrentChange" header-cell-class-name="comm_table_header">
                    <el-table-column label="操作" width="150">
                        <template #default="scope">
                            <el-button size="small" @click="edit(scope.row)">
                                编辑
                            </el-button>
                            <el-button size="small" type="danger" @click="del(scope.row)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                    <el-table-column prop="code" label="代码" width="150"></el-table-column>
                    <el-table-column prop="name" label="名称" width="180"></el-table-column>
                    <el-table-column prop="type" label="类型">
                        <template #default="scope">
                            <span>{{ mapOptions(this.typeOptions, scope.row.type) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="increment" label="自增">
                        <template #default="scope">
                            <span>{{ scope.row.increment ? "是" : "否" }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div>
                <div class="top_bar">
                    <div>
                        <span class="top_nav">{{ selectedCodeTable.name }}</span>
                        <span style="color: #333333;font-size:0.7em" @click="changeIncrement">{{ newValueMode }}</span>
                    </div>
                    <div>
                        <template v-if="this.viewMode === 'view'">
                            <el-button size="small" @click="openExportDialog">导出</el-button>
                            <el-button size="small" @click="editContent">编辑</el-button>
                        </template>
                        <template v-else>
                            <el-button size="small" type="success" @click="addContent">新增</el-button>
                            <el-button size="small" type="primary" @click="saveContent">保存</el-button>
                            <el-button size="small" type="warning" @click="cancelEditContent">取消</el-button>
                        </template>

                    </div>
                </div>
                <el-table :data="contentList" border header-cell-class-name="comm_table_header">
                    <el-table-column label="操作" v-if="viewMode === 'edit'">
                        <template #default="scope">
                            <el-button size="small" type="danger" @click="deleteItem(scope.$index)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                    <el-table-column prop="value" label="实际值" width="150">
                        <template #default="scope">
                            <span v-if="viewMode === 'view'">{{ scope.row.value }}</span>
                            <el-input v-else v-model="scope.row.value" @change="rowChange(scope.row, 'UPDATE')" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="label" label="显示值" width="150">
                        <template #default="scope">
                            <span v-if="viewMode === 'view'" :style="'color:' + scope.row.color">{{ scope.row.label
                            }}</span>
                            <el-input v-else v-model="scope.row.label" @change="rowChange(scope.row, 'UPDATE')" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="color" label="颜色" width="150">
                        <template #default="scope">
                            <span v-if="viewMode === 'view'">{{ scope.row.color }}</span>
                            <el-color-picker v-else v-model="scope.row.color"
                                @change="rowChange(scope.row, 'UPDATE')" />
                            <span v-if="viewMode !== 'view'" :style="'color:' + scope.row.color">{{ scope.row.label
                            }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </el-card>
    <el-dialog v-model="dialogVisible" title="编辑码表" width="500" center>
        <el-form :model="codeTable" label-width="50">
            <el-form-item label="代码">
                <el-input v-model="codeTable.code"></el-input>
            </el-form-item>
            <el-form-item label="名称">
                <el-input v-model="codeTable.name"></el-input>
            </el-form-item>
            <el-form-item label="类型">
                <el-select v-model="codeTable.type" placeholder="选择一个类型">
                    <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
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
    <el-dialog v-model="exportDialogVisible" title="码表导出" width="80%" center>
        <el-form :model="exportConfig" label-width="50">
            <el-form-item label="类型">
                <el-select v-model="exportConfig.type" placeholder="选择一个类型" @change="exportTypeChange">
                    <el-option v-for="item in exportTypeOptions" :key="item.value" :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="预览">
                <el-input v-model="exportConfig.preview" type="textarea" :autosize="{ minRows: 10, maxRows: 1000 }"
                    readonly>
                </el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="copyText">复制文本</el-button>
                <el-button type="primary" @click="exportDialogVisible = false">
                    取消
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script>
import { commQuery } from "@/util/query";
import { ElMessage } from "element-plus";
export default {
    data() {
        return {
            model_url: "/codeTable",
            newValueMode: "",
            selectedCodeTable: {},
            list: [],
            contentList: [],
            contentDeletedList: [],
            saveMode: "add",//add update
            viewMode: "view",//view edit
            hiddenData: false,
            codeTable: {},
            dialogVisible: false,
            exportDialogVisible: false,
            exportConfig: {
                type: "1",
                preview: "",
            },
            exportTypeOptions: [
                { value: "1", label: "JSON" },
                { value: "2", label: "注释" },
                { value: "3", label: "Java常量" },
            ],
            typeOptions: [
                { value: "1", label: "系统" },
                { value: "2", label: "业务" }
            ],
            queryParams: {
                type: ""
            }
        }
    },
    mounted() {
        this.getList().then(res => {
            if (this.list.length > 0) {
                this.$refs.directoryTable.setCurrentRow(this.list[0]);
            }
        })
    },

    methods: {
        onSubmit() {
            this.getList();
        },
        getList() {
            return commQuery(this.model_url + "/directory/queryList", this.queryParams,).then(res => {
                if (res.success) {
                    this.list = res.data;
                }
            })
        },
        openDialog() {
            this.dialogVisible = true;
            this.saveMode = "add";
            this.codeTable = {};
        },
        save() {
            if (this.saveMode === "add") {
                commQuery(this.model_url + "/directory/add", this.codeTable).then(res => {
                    this.dialogVisible = false;
                    this.getList();
                })
            } else if (this.saveMode === "update") {
                commQuery(this.model_url + "/directory/update", this.codeTable).then(res => {
                    this.dialogVisible = false;
                    this.getList();
                })
            }
        },
        edit(row) {
            this.codeTable = row;
            this.dialogVisible = true;
            this.saveMode = "update"
        },
        del(row) {
            this.codeTable = row
            commQuery(this.model_url + "/directory/delete", this.codeTable).then(res => {
                this.getList();
            })
        },
        handleCurrentChange(currentRow, oldCurrentRow) {
            if (currentRow != null) {
                this.viewMode = 'view';
                this.selectedCodeTable = currentRow;
                this.newValueMode = currentRow.increment ? "自增模式" : "自定义模式";
                this.getContentList()
            } else {
                this.contentList = []
            }
        },
        editContent() {
            this.viewMode = 'edit';
        },
        changeType(value) {
            this.getList().then(res => {
                if (this.list.length > 0) {
                    this.$refs.directoryTable.setCurrentRow(this.list[0]);
                }
            })
        },
        mapOptions(options, value) {
            let res = "";
            let temp = options.find(x => x.value === value)
            if (temp != null) {
                res = temp.label
            }
            return res;
        },
        getContentList() {
            commQuery(this.model_url + "/content/queryList", { code: this.selectedCodeTable.code }).then(res => {
                if (res.success) {
                    this.contentList = res.data ? res.data : []
                }
            })
        },
        addContent() {
            let newItem = { code: this.selectedCodeTable.code, dataStatus: "ADD", color: "#606266" };
            if (this.selectedCodeTable.increment) {
                newItem.value = this.contentList.length;
            }
            this.contentList.push(newItem);
        },
        saveContent() {
            commQuery(this.model_url + "/content/save", this.contentList.concat(this.contentDeletedList)).then(res => {
                this.viewMode = 'view'
                this.getContentList()
            })
        },
        cancelEditContent() {
            this.viewMode = 'view'
            this.getContentList();
        },
        changeIncrement() {
            if (this.viewMode === 'view') {
                return;
            }
            if (this.selectedCodeTable) {

            }
        },
        deleteItem(index) {
            //删除元素
            let deletedItem = this.contentList.splice(index, 1)[0];
            //非新增数据，加入删除数组
            if (deletedItem.dataStatus != 'ADD') {
                deletedItem.dataStatus = "DELETE";
                this.contentDeletedList.push(deletedItem);
            }
        },
        rowChange(row, dataStatus) {
            switch (dataStatus) {
                case "ADD":
                    row.dataStatus = dataStatus; break;
                case "UPDATE":
                    if (row.dataStatus != "ADD") {
                        row.dataStatus = dataStatus
                    }; break;
                case "DELETE":
                    row.dataStatus = dataStatus
            }
        },
        openExportDialog() {
            this.exportDialogVisible = true;
            this.exportTypeChange();
        },
        /**
         * 
         */
        exportTypeChange() {
            switch (this.exportConfig.type) {
                case "1":
                    this.exportConfig.preview = JSON.stringify(this.contentList.map(({ value, label, color }) => ({ value, label, color })), null, 4); break;
                case "2":
                    let temp = "";
                    this.contentList.forEach(x => {
                        temp += `,${x.value} ${x.label}`
                    })
                    this.exportConfig.preview = "// " + temp.substring(1); break;
                case "3":
                    let temp2 = "";
                    this.contentList.forEach(x => {
                        temp2 += ` /**\n* ${this.selectedCodeTable.name}——${x.label}\n*/\npublic static final String ${this.selectedCodeTable.code.toUpperCase()}_${x.value.toUpperCase()}="${x.value}";\n`
                    })
                    this.exportConfig.preview = temp2; break;
            }
        },
        copyText() {
            // 现代方法
            navigator.clipboard.writeText(this.exportConfig.preview);
            ElMessage({
                message: '复制成功',
                type: 'success',
            })
        }
    }
}
</script>
<style>
.page {
    height: 700px;
}

.flex_r {
    display: flex;
    flex-direction: row;
}
</style>
