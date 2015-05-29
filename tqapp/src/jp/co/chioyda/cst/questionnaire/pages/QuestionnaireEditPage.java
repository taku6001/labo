package jp.co.chioyda.cst.questionnaire.pages;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.enterprise.context.RequestScoped;
import javax.faces.view.ViewScoped;
import javax.inject.Inject;
import javax.inject.Named;

import jp.co.chioyda.cst.questionnaire.biz.QuestionnaireEditBiz;
import jp.co.chioyda.cst.questionnaire.model.TrToolItems;

@Named
@RequestScoped
public class QuestionnaireEditPage implements Serializable {
	private static final long serialVersionUID = 1L;
	private String qa01;
	private List<String> tools;
	private String[] selectedTools;
	private String reasonTools;

	@Inject
	private QuestionnaireEditBiz biz;
	
	public String answerQuestion(){
		return "index.xhtml";
	}
	
	public String getQa01() {
		return qa01;
	}

	public void setQa01(String qa01) {
		this.qa01 = qa01;
	}

	public QuestionnaireEditPage() {
		// TODO Auto-generated constructor stub
	}
	
	@PostConstruct
	public void setTools(){
		List<TrToolItems> tools = biz.findToolItems();
		selectedTools = new String[tools.size()];
		
		for(int i = 0; i < tools.size(); i++){
			selectedTools[i] = tools.get(i).getName();
		}
	}

	public List<String> getTools() {
		return tools;
	}

	public void setTools(List<String> tools) {
		this.tools = tools;
	}

	public String[] getSelectedTools() {
		return selectedTools;
	}

	public void setSelectedTools(String[] selectedTools) {
		this.selectedTools = selectedTools;
	}

	public String getReasonTools() {
		return reasonTools;
	}

	public void setReasonTools(String reasonTools) {
		this.reasonTools = reasonTools;
	}
}
