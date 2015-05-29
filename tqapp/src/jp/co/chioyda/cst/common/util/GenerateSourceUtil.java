package jp.co.chioyda.cst.common.util;

import javax.persistence.Persistence;

public class GenerateSourceUtil {
	public static void main(String args[]) {
		Persistence.generateSchema("tqapp", null);

	}
}
