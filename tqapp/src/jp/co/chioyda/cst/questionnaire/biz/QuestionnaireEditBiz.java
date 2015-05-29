package jp.co.chioyda.cst.questionnaire.biz;

import java.util.List;

import javax.enterprise.context.Dependent;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.transaction.Transactional;

import jp.co.chioyda.cst.questionnaire.model.TrToolItems;

@Dependent
@Transactional(Transactional.TxType.NOT_SUPPORTED)
public class QuestionnaireEditBiz {
	@PersistenceContext
	private EntityManager em;
	
	public List<TrToolItems> findToolItems(){
		System.out.println("****************************" + TrToolItems.Q_TOOL_ITEMS_FIND_ALL);
//		TypedQuery<TrToolItems> query = em.createQuery(TrToolItems.Q_TOOL_ITEMS_FIND_ALL.toString(), TrToolItems.class);
		TypedQuery<TrToolItems> query = em.createNamedQuery(TrToolItems.Q_TOOL_ITEMS_FIND_ALL, TrToolItems.class);
		return query.getResultList();
	}
	
	public QuestionnaireEditBiz() {
		// TODO Auto-generated constructor stub
	}
}
