module.exports = {
  getTreeData(question,reply){
		//用来接收树形结构的数组
		const TreeList =[]
		//对数组进行遍历
		question.forEach(item=>{
		
		//判断是不是问题
      if (item.question) {
      //给问题添加一个数组
      item.reply = []
			TreeList.push(item)
		}
		//使用过滤 如果pid与id相同就是子元素
		const children = reply.filter(data=>data.ques_id===item.id)
		item.reply = children 
		})
		return TreeList 
}

}