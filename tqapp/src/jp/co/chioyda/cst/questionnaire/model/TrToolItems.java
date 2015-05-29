package jp.co.chioyda.cst.questionnaire.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Id;


@Entity
@Table(name = "TR_TOOL_ITEMS")
@NamedQuery(name = "TrToolItems.findAll", query = "SELECT t FROM TrToolItems t")
public class TrToolItems {
	public static String Q_TOOL_ITEMS_FIND_ALL = "TrToolItems.findAll"; 
	@Id @GeneratedValue
	private long Id;
	
	@Column(name = "NAME")
	private String name;

	public long getId() {
		return Id;
	}

	public void setId(long id) {
		Id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	
}
